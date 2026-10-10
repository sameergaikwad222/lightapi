import { createEmptyRequest, REQUEST_METHODS } from "./request.js";
import { inferBodyType, normalizeRequestBody } from "./requestBody.js";

// Parse pasted text only; shell expressions and commands are never executed.
function tokenize(command) {
  const tokens = [];
  let token = "";
  let started = false;
  let quote = null;

  for (let i = 0; i < command.length; i++) {
    const char = command[i];
    const next = command[i + 1];

    if (quote === "'") {
      if (char === "'") quote = null;
      else token += char;
      continue;
    }

    if (quote === "ansi") {
      if (char === "'") {
        quote = null;
      } else if (char === "\\") {
        if (next === undefined) throw new Error("The cURL command ends with an incomplete escape.");
        const escapes = { n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", v: "\v", "\\": "\\", "'": "'", '"': '"' };
        if (next === "x" || next === "u") {
          const length = next === "x" ? 2 : 4;
          const digits = command.slice(i + 2, i + 2 + length);
          if (!new RegExp(`^[0-9a-f]{${length}}$`, "i").test(digits)) {
            throw new Error("The cURL command contains an invalid character escape.");
          }
          token += String.fromCharCode(parseInt(digits, 16));
          i += length + 1;
        } else {
          token += escapes[next] ?? `\\${next}`;
          i++;
        }
      } else token += char;
      continue;
    }

    if (char === "\\" || (!quote && (char === "^" || char === "`"))) {
      if (next === "\n" || (next === "\r" && command[i + 2] === "\n")) {
        i += next === "\r" ? 2 : 1;
        continue;
      }
      if (char === "\\") {
        if (next === undefined) throw new Error("The cURL command ends with an incomplete escape.");
        if (!quote || ['"', "\\", "$", "`"].includes(next)) {
          token += next;
          started = true;
          i++;
          continue;
        }
      }
    }

    if (quote === '"') {
      if (char === '"') quote = null;
      else token += char;
    } else if (char === "$" && next === "'") {
      quote = "ansi";
      started = true;
      i++;
    } else if (char === "'" || char === '"') {
      quote = char;
      started = true;
    } else if (/\s/.test(char)) {
      if (started) tokens.push(token);
      token = "";
      started = false;
    } else {
      token += char;
      started = true;
    }
  }

  if (quote) throw new Error("The cURL command has an unclosed quote.");
  if (started) tokens.push(token);
  return tokens;
}

const valueOptions = new Set([
  "--url", "-X", "--request", "-H", "--header", "-d", "--data",
  "--data-ascii", "--data-raw", "--data-binary", "--data-urlencode", "--json",
  "-u", "--user", "-b", "--cookie", "-A", "--user-agent", "-e", "--referer",
  "--oauth2-bearer",
]);
const browserOptions = new Set([
  "--compressed", "-L", "--location", "-s", "--silent", "-S", "--show-error",
  "-v", "--verbose", "-i", "--include", "-g", "--globoff", "--http1.1", "--http2", "--basic",
]);
const dataOptions = new Set([
  "-d", "--data", "--data-ascii", "--data-raw", "--data-binary", "--data-urlencode", "--json",
]);

export function parseCurl(command) {
  const tokens = tokenize(command.trim());
  if (!/^(?:.*[/\\])?curl(?:\.exe)?$/i.test(tokens.shift() || "")) {
    throw new Error("Paste a command that starts with curl.");
  }

  const request = createEmptyRequest();
  let explicitMethod = "";
  let get = false;
  let head = false;
  let hasData = false;
  let json = false;

  const setHeader = (key, value) => {
    request.headers = request.headers.filter(header => header.key.toLowerCase() !== key.toLowerCase());
    request.headers.push({ key, value });
  };
  const hasHeader = key => request.headers.some(header => header.key.toLowerCase() === key);
  const setUrl = value => {
    if (request.url) throw new Error("Import one request URL at a time.");
    request.url = value;
  };

  for (let i = 0; i < tokens.length; i++) {
    let option = tokens[i];
    let value;
    if (option.startsWith("--") && option.includes("=")) {
      const separator = option.indexOf("=");
      value = option.slice(separator + 1);
      option = option.slice(0, separator);
    } else if (/^-[XHdubAe].+/.test(option)) {
      value = option.slice(2);
      option = option.slice(0, 2);
    }

    if (valueOptions.has(option)) {
      if (value === undefined) value = tokens[++i];
      if (value === undefined) throw new Error(`Missing value for ${option}.`);
    } else if (value !== undefined) {
      throw new Error(`Unsupported cURL option: ${option}.`);
    }

    if (option === "--url") setUrl(value);
    else if (option === "-X" || option === "--request") explicitMethod = value.toUpperCase();
    else if (option === "-H" || option === "--header") {
      if (value.startsWith("@")) throw new Error("Paste header values directly instead of referencing a file.");
      const colon = value.indexOf(":");
      if (colon < 1) throw new Error(`Invalid header: ${value}. Use Header: value.`);
      setHeader(value.slice(0, colon).trim(), value.slice(colon + 1).trim());
    } else if (option === "-u" || option === "--user") {
      const colon = value.indexOf(":");
      request.auth = {
        ...request.auth,
        type: "basic",
        username: colon === -1 ? value : value.slice(0, colon),
        password: colon === -1 ? "" : value.slice(colon + 1),
      };
    } else if (option === "--oauth2-bearer") {
      request.auth = { ...request.auth, type: "bearer", token: value };
    } else if (option === "-b" || option === "--cookie") {
      if (!value.includes("=")) throw new Error("Paste cookie values directly instead of referencing a cookie file.");
      setHeader("Cookie", value);
    } else if (option === "-A" || option === "--user-agent") setHeader("User-Agent", value);
    else if (option === "-e" || option === "--referer") setHeader("Referer", value);
    else if (option === "-G" || option === "--get") get = true;
    else if (option === "-I" || option === "--head") head = true;
    else if (dataOptions.has(option)) {
      if (option !== "--data-raw" && value.startsWith("@")) {
        throw new Error("Paste the request body directly instead of referencing a file or stdin.");
      }
      if (option === "--data-urlencode") {
        const equals = value.indexOf("=");
        if (equals === -1 && value.includes("@")) throw new Error("File-based form values are not supported. Paste the value directly.");
        value = equals === -1
          ? encodeURIComponent(value)
          : `${value.slice(0, equals)}${equals > 0 ? "=" : ""}${encodeURIComponent(value.slice(equals + 1))}`;
      }
      if (option === "--json") json = true;
      request.body += (hasData && option !== "--json" ? "&" : "") + value;
      hasData = true;
    } else if (browserOptions.has(option) || /^-[sSLivg]+$/.test(option)) {
      // Transport and output handling are managed by the browser.
    } else if (option.startsWith("-")) {
      throw new Error(`Unsupported cURL option: ${option}. Remove it or enter this request manually.`);
    } else {
      setUrl(option);
    }
  }

  if (!request.url || !/^(?:https?:\/\/|\{\{[^}]+\}\})/i.test(request.url)) {
    throw new Error("The cURL command must include an HTTP or HTTPS URL (or a base URL variable).");
  }
  try {
    const candidate = request.url.replace(/^\{\{[^}]+\}\}/, "https://example.invalid").replace(/\{\{[^}]+\}\}/g, "placeholder");
    new URL(candidate);
  } catch {
    throw new Error("The cURL command contains an invalid URL.");
  }
  if (head && hasData && !get) throw new Error("A HEAD request cannot include a body. Remove the data option or use --get.");

  request.method = explicitMethod || (head ? "HEAD" : get ? "GET" : hasData ? "POST" : "GET");
  if (!REQUEST_METHODS.includes(request.method)) throw new Error(`Unsupported request method: ${request.method}.`);

  if (get && hasData) {
    const hash = request.url.indexOf("#");
    const base = hash === -1 ? request.url : request.url.slice(0, hash);
    const fragment = hash === -1 ? "" : request.url.slice(hash);
    request.url = `${base}${base.includes("?") ? "&" : "?"}${request.body}${fragment}`;
    request.body = "";
  } else if (hasData && !hasHeader("content-type")) {
    setHeader("Content-Type", json ? "application/json" : "application/x-www-form-urlencoded");
  }
  if (json && !hasHeader("accept")) setHeader("Accept", "application/json");
  if (hasHeader("authorization")) request.auth = createEmptyRequest().auth;

  request.bodyType = inferBodyType(request.headers);
  // Imported form bodies become editable rows, including repeated keys.
  delete request.bodyFields;
  return { ...request, ...normalizeRequestBody(request) };
}
