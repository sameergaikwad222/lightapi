const EXTENSIONS = {
  "application/json": "json", "application/xml": "xml", "text/xml": "xml",
  "text/html": "html", "text/plain": "txt", "text/csv": "csv",
  "text/tab-separated-values": "tsv", "application/javascript": "js",
  "image/png": "png", "image/jpeg": "jpg", "image/gif": "gif", "image/webp": "webp",
  "image/svg+xml": "svg", "image/avif": "avif", "image/bmp": "bmp",
  "audio/mpeg": "mp3", "audio/wav": "wav", "audio/ogg": "ogg",
  "video/mp4": "mp4", "video/webm": "webm", "application/pdf": "pdf",
  "application/zip": "zip", "application/octet-stream": "bin",
};

export function getResponseHeader(headers = {}, name) {
  return Object.entries(headers).find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1] ?? "";
}

export function detectResponseFormat(contentType = "", text = "", data) {
  const mime = contentType.split(";")[0].trim().toLowerCase();
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";
  if (/^application\/(?:[\w.-]+\+)?json$/.test(mime)) return "json";
  if (mime === "text/html" || mime === "application/xhtml+xml") return "html";
  if (/^(?:application|text)\/(?:[\w.-]+\+)?xml$/.test(mime)) return "xml";
  if (["text/csv", "application/csv", "text/tab-separated-values"].includes(mime)) return "csv";
  if (mime.startsWith("text/") || /(?:javascript|yaml|x-www-form-urlencoded)$/.test(mime)) return "text";
  if (mime) return "binary";
  if (data != null && typeof data === "object" && !(data instanceof Blob)) return "json";
  if (text?.trim()) {
    try { JSON.parse(text); return "json"; } catch { /* Try other text formats. */ }
    if (/^\s*(?:<!doctype\s+html|<html[\s>])/i.test(text)) return "html";
    if (/^\s*(?:<\?xml\s|<[\w:-]+(?:\s|>|\/))/i.test(text)) return "xml";
  }
  return text === null ? "binary" : "text";
}

export function responseFilename(headers, format, contentType) {
  const disposition = getResponseHeader(headers, "content-disposition");
  const encoded = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)?.[1];
  let name;
  if (encoded) {
    try { name = decodeURIComponent(encoded.trim()); } catch { /* Use the plain filename instead. */ }
  }
  name ??= disposition.match(/filename\s*=\s*(?:"([^"]*)"|([^;]+))/i)?.slice(1).find(value => value !== undefined)?.trim();
  if (name) {
    name = Array.from(name.split(/[/\\]/).at(-1)).filter(char => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127).join("");
    if (name && name !== "." && name !== "..") return name;
  }
  const mime = contentType.split(";")[0].trim().toLowerCase();
  return `response.${EXTENSIONS[mime] ?? ({ json: "json", xml: "xml", html: "html", text: "txt", csv: "csv" }[format] ?? "bin")}`;
}

export function formatHex(bytes, totalSize = bytes.length) {
  const lines = [];
  for (let offset = 0; offset < bytes.length; offset += 16) {
    const row = bytes.slice(offset, offset + 16);
    const hex = Array.from(row, byte => byte.toString(16).padStart(2, "0")).join(" ").padEnd(47, " ");
    const ascii = Array.from(row, byte => byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : ".").join("");
    lines.push(`${offset.toString(16).padStart(8, "0")}  ${hex}  ${ascii}`);
  }
  if (totalSize > bytes.length) lines.push(`\nShowing the first ${bytes.length.toLocaleString()} of ${totalSize.toLocaleString()} bytes. Download for the complete response.`);
  return lines.join("\n");
}

export async function normalizeResponse(response, time = 0) {
  const headers = response.headers?.toJSON?.() ?? response.headers ?? {};
  const contentType = getResponseHeader(headers, "content-type");
  const blob = response.data instanceof Blob ? response.data : new Blob([
    response.data == null ? "" : typeof response.data === "string" ? response.data : JSON.stringify(response.data),
  ], { type: contentType });
  const mime = contentType.split(";")[0].trim().toLowerCase();
  const initialFormat = detectResponseFormat(contentType);
  let rawText = null;
  // SVG also has a useful XML source view. Missing MIME types are checked for binary bytes.
  let textual = ["json", "xml", "html", "text", "csv"].includes(initialFormat) || mime === "image/svg+xml";
  if (!mime) {
    const sample = new Uint8Array(await blob.slice(0, 512).arrayBuffer());
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(sample, { stream: true });
      textual = !sample.includes(0);
    } catch { textual = false; }
  }
  if (textual) {
    const charset = contentType.match(/charset\s*=\s*["']?([^;\s"']+)/i)?.[1] ?? "utf-8";
    let decoder;
    try { decoder = new TextDecoder(charset); } catch { decoder = new TextDecoder(); }
    rawText = decoder.decode(await blob.arrayBuffer());
  }
  const format = detectResponseFormat(contentType, rawText);
  let data = rawText ?? blob;
  if (format === "json" && rawText?.trim()) {
    try { data = JSON.parse(rawText); } catch { /* Invalid JSON stays visible as source text. */ }
  }
  return {
    status: response.status, statusText: response.statusText, headers, data,
    rawText, blob, size: blob.size, format, contentType, time,
    filename: responseFilename(headers, format, contentType),
    hex: rawText === null ? formatHex(new Uint8Array(await blob.slice(0, 1024).arrayBuffer()), blob.size) : "",
  };
}

export function responseText(response) {
  if (typeof response.rawText === "string") return response.rawText;
  if (typeof response.data === "string") return response.data;
  if (response.data instanceof Blob) return null;
  return JSON.stringify(response.data, null, 2) ?? "";
}

export function parseCsv(text, delimiter = ",") {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"' && field === "") quoted = true;
    else if (char === delimiter) { row.push(field); field = ""; }
    else if (char === "\r" || char === "\n") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      rows.push([...row, field]); row = []; field = "";
    } else field += char;
  }
  if (quoted) throw new Error("CSV contains an unclosed quoted value. View the raw response for its original content.");
  if (row.length || field || (text.length && !/[\r\n]$/.test(text))) rows.push([...row, field]);
  return rows;
}

export function prettyXml(text) {
  const document = new DOMParser().parseFromString(text, "application/xml");
  if (document.getElementsByTagName("parsererror").length) return { text, error: "Invalid XML. Showing the original response." };
  const serializer = new XMLSerializer();
  function format(node, depth = 0) {
    const indent = "  ".repeat(depth);
    if (node.nodeType !== 1 || !node.children.length || Array.from(node.childNodes).some(child =>
      child.nodeType === 4 || (child.nodeType === 3 && child.textContent.trim()),
    )) return indent + serializer.serializeToString(node);
    const opening = serializer.serializeToString(node.cloneNode(false)).replace(/\/>$/, ">");
    const children = Array.from(node.childNodes).filter(child => child.nodeType !== 3 || child.textContent.trim());
    return `${indent}${opening}\n${children.map(child => format(child, depth + 1)).join("\n")}\n${indent}</${node.nodeName}>`;
  }
  const declaration = text.match(/^\s*(<\?xml[^?]*\?>)/)?.[1];
  return { text: [declaration, ...Array.from(document.childNodes).map(node => format(node))].filter(Boolean).join("\n"), error: "" };
}

export function htmlPreviewDocument(html) {
  // The source remains available in Raw; the preview cannot execute scripts or load remote resources.
  return `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; form-action 'none'; base-uri 'none'"></head><body>${html}</body></html>`;
}
