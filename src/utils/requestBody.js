export const BODY_TYPES = [
  { value: "none", label: "None" },
  { value: "json", label: "JSON", contentType: "application/json", language: "json" },
  { value: "xml", label: "XML", contentType: "application/xml", language: "xml" },
  { value: "text", label: "Text", contentType: "text/plain", language: "plaintext" },
  { value: "html", label: "HTML", contentType: "text/html", language: "html" },
  { value: "javascript", label: "JavaScript", contentType: "application/javascript", language: "javascript" },
  { value: "form-data", label: "form-data", contentType: "multipart/form-data" },
  { value: "urlencoded", label: "x-www-form-urlencoded", contentType: "application/x-www-form-urlencoded" },
  { value: "binary", label: "Binary file", contentType: "application/octet-stream" },
];

export function inferBodyType(headers = []) {
  const mime = headers.find(header => header.key.trim().toLowerCase() === "content-type")?.value
    .split(";")[0].trim().toLowerCase();
  if (!mime || /^application\/(?:[\w.-]+\+)?json$/.test(mime)) return "json";
  if (/^(?:application|text)\/(?:[\w.-]+\+)?xml$/.test(mime)) return "xml";
  if (mime === "multipart/form-data") return "form-data";
  if (mime === "application/x-www-form-urlencoded") return "urlencoded";
  if (mime === "text/html") return "html";
  if (["application/javascript", "text/javascript"].includes(mime)) return "javascript";
  return "text";
}

export function fileMetadata(file) {
  return file ? { name: file.name ?? "upload", size: file.size, type: file.type } : null;
}

export function createBodyField(key = "", value = "") {
  return { id: crypto.randomUUID(), key, value, type: "text", enabled: true, file: null, fileMeta: null };
}

export function normalizeRequestBody(request) {
  const bodyType = request.bodyType ?? inferBodyType(request.headers);
  return {
    bodyType,
    bodyFields: (request.bodyFields ?? (bodyType === "urlencoded"
      ? Array.from(new URLSearchParams(request.body ?? ""), ([key, value]) => createBodyField(key, value))
      : [])).map(field => ({ ...field, id: field.id ?? crypto.randomUUID(), enabled: field.enabled !== false })),
    bodyFile: request.bodyFile ?? null,
    bodyFileMeta: request.bodyFileMeta ?? fileMetadata(request.bodyFile),
  };
}

export function headersForBodyType(headers, bodyType) {
  const remaining = headers.filter(header => header.key.trim().toLowerCase() !== "content-type");
  const format = BODY_TYPES.find(type => type.value === bodyType);
  if (format?.contentType && bodyType !== "form-data") {
    remaining.push({ key: "Content-Type", value: format.contentType });
  }
  return remaining;
}

function isFile(file) {
  return typeof Blob !== "undefined" && file instanceof Blob;
}

// Keep the user's raw text intact. Only form formats need serialization.
export function prepareRequestBody(request, headers = {}, resolve = value => value) {
  const normalized = normalizeRequestBody(request);
  const { bodyType, bodyFields, bodyFile, bodyFileMeta } = normalized;
  const resultHeaders = { ...headers };
  const contentTypeKeys = Object.keys(resultHeaders).filter(key => key.trim().toLowerCase() === "content-type");
  const format = BODY_TYPES.find(type => type.value === bodyType);
  if (!format) throw new Error("Select a supported body type.");

  if (bodyType === "none" || bodyType === "form-data") {
    contentTypeKeys.forEach(key => delete resultHeaders[key]);
  } else if (!contentTypeKeys.length && format.contentType) {
    resultHeaders["Content-Type"] = format.contentType;
  }

  if (bodyType === "none") return { data: undefined, headers: resultHeaders };
  if (bodyType === "binary") {
    if (!isFile(bodyFile)) throw new Error(bodyFileMeta
      ? `Select ${bodyFileMeta.name} again to send this file.`
      : "Choose a file for the binary request body.");
    return { data: bodyFile, headers: resultHeaders };
  }
  if (bodyType === "form-data" || bodyType === "urlencoded") {
    const data = bodyType === "form-data" ? new FormData() : new URLSearchParams();
    for (const field of bodyFields) {
      if (field.enabled === false || !field.key.trim()) continue;
      const key = resolve(field.key);
      if (field.type === "file" && bodyType === "urlencoded") {
        throw new Error("File uploads require form-data or a binary body. Change the file field to Text or choose form-data.");
      }
      if (field.type === "file" && bodyType === "form-data") {
        if (!isFile(field.file)) throw new Error(`Choose a file for the "${key}" field${field.fileMeta ? ` (${field.fileMeta.name})` : ""}.`);
        data.append(key, field.file, field.file.name ?? "upload");
      } else if (field.type !== "file") {
        data.append(key, resolve(field.value ?? ""));
      }
    }
    return { data: bodyType === "urlencoded" ? data.toString() : data, headers: resultHeaders };
  }

  const data = resolve(request.body ?? "");
  if (bodyType === "json" && data.trim()) {
    try { JSON.parse(data); } catch { throw new Error("Invalid JSON. Check the body before sending."); }
  }
  return { data: data || undefined, headers: resultHeaders };
}

// Files stay available in live tabs. Disk storage keeps their metadata for re-selection.
export function bodyStorageReplacer(key, value) {
  if ((key === "file" || key === "bodyFile") && isFile(value)) return null;
  return value;
}
