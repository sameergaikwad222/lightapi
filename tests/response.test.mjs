import test from "node:test";
import assert from "node:assert/strict";
import { detectResponseFormat, normalizeResponse, parseCsv, responseFilename, responseText } from "../src/utils/response.js";

test("response formats follow Content-Type, including vendor JSON, XML and media", () => {
  for (const [mime, format] of [
    ["application/problem+json; charset=utf-8", "json"], ["application/soap+xml", "xml"],
    ["text/html", "html"], ["application/xhtml+xml", "html"], ["text/plain", "text"],
    ["text/csv", "csv"], ["text/tab-separated-values", "csv"],
    ["image/svg+xml", "image"], ["image/png", "image"], ["audio/mpeg", "audio"],
    ["video/mp4", "video"], ["application/pdf", "binary"], ["application/octet-stream", "binary"],
  ]) assert.equal(detectResponseFormat(mime), format, mime);
  assert.equal(detectResponseFormat("text/plain", '{"literal":true}'), "text");
  assert.equal(detectResponseFormat("", '{"user":"Ada"}'), "json");
  assert.equal(detectResponseFormat("", "<root/>"), "xml");
  assert.equal(detectResponseFormat("", "<!doctype html><html></html>"), "html");
});

test("JSON keeps both parsed data and the exact original response bytes", async () => {
  const raw = '{ "name": "Ada", "number": 1 }\n';
  const result = await normalizeResponse({ status: 200, headers: { "Content-Type": "application/json" }, data: new Blob([raw]) }, 12);
  assert.deepEqual(result.data, { name: "Ada", number: 1 });
  assert.equal(result.rawText, raw);
  assert.equal(await result.blob.text(), raw);
  assert.equal(result.size, new TextEncoder().encode(raw).length);
  assert.equal(result.filename, "response.json");
  assert.equal(result.time, 12);
});

test("invalid JSON and HTTP errors retain their status and readable body", async () => {
  const result = await normalizeResponse({ status: 422, statusText: "Unprocessable Entity", headers: { "content-type": "application/json" }, data: new Blob(["invalid JSON"]) });
  assert.equal(result.status, 422);
  assert.equal(result.format, "json");
  assert.equal(result.data, "invalid JSON");
  assert.equal(result.rawText, "invalid JSON");
});

test("text formats are never JSON quoted and text charsets are respected", async () => {
  const text = "first line\nsecond line\n";
  const result = await normalizeResponse({ headers: { "content-type": "text/plain" }, data: new Blob([text]) });
  assert.equal(result.data, text);
  assert.equal(responseText(result), text);
  const latin = await normalizeResponse({ headers: { "content-type": "text/plain; charset=iso-8859-1" }, data: new Blob([new Uint8Array([99, 97, 102, 233])]) });
  assert.equal(latin.rawText, "café");
  assert.equal(latin.size, 4);
});

test("binary data and downloads keep exact bytes and use a bounded hex preview", async () => {
  const bytes = new Uint8Array(1400).fill(255);
  bytes[0] = 0;
  const result = await normalizeResponse({ headers: { "content-type": "application/octet-stream", "content-disposition": 'attachment; filename="archive.bin"' }, data: new Blob([bytes]) });
  assert.equal(result.format, "binary");
  assert.equal(result.rawText, null);
  assert.equal(responseText(result), null);
  assert.equal(result.size, bytes.length);
  assert.equal(result.filename, "archive.bin");
  assert.deepEqual(new Uint8Array(await result.blob.arrayBuffer()), bytes);
  assert.match(result.hex, /^00000000  00 ff/);
  assert.match(result.hex, /first 1,024 of 1,400 bytes/);
});

test("missing Content-Type detects JSON and text without corrupting binary", async () => {
  const json = await normalizeResponse({ data: new Blob(['{"ok":true}']) });
  assert.equal(json.format, "json");
  const binary = await normalizeResponse({ data: new Blob([new Uint8Array([0, 255, 128, 65])]) });
  assert.equal(binary.format, "binary");
  assert.equal(binary.rawText, null);
});

test("SVG is previewable as an image while retaining readable XML source", async () => {
  const raw = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>';
  const result = await normalizeResponse({ headers: { "content-type": "image/svg+xml" }, data: new Blob([raw], { type: "image/svg+xml" }) });
  assert.equal(result.format, "image");
  assert.equal(result.rawText, raw);
  assert.equal(result.filename, "response.svg");
});

test("empty responses contain zero bytes and no placeholder body", async () => {
  for (const data of [null, undefined, new Blob([])]) {
    const result = await normalizeResponse({ status: 204, data });
    assert.equal(result.size, 0);
    assert.equal(result.rawText, "");
  }
});

test("CSV and TSV handle quoted commas, newlines, escaped quotes and empty cells", () => {
  const csv = 'name,description,empty\r\nAda,"a,b",\r\nSam,"first\nsecond ""quote""",\r\n';
  assert.deepEqual(parseCsv(csv), [["name", "description", "empty"], ["Ada", "a,b", ""], ["Sam", 'first\nsecond "quote"', ""]]);
  assert.deepEqual(parseCsv("name\tvalue\nAda\t1\n", "\t"), [["name", "value"], ["Ada", "1"]]);
  assert.throws(() => parseCsv('name\n"unclosed'), /unclosed/);
});

test("download names honor disposition, Unicode names and MIME extensions", () => {
  assert.equal(responseFilename({ "Content-Disposition": "attachment; filename*=UTF-8''caf%C3%A9.csv" }, "csv", "text/csv"), "café.csv");
  assert.equal(responseFilename({ "content-disposition": 'attachment; filename="../../file.xml"' }, "xml", "text/xml"), "file.xml");
  assert.equal(responseFilename({}, "binary", "application/pdf"), "response.pdf");
  assert.equal(responseFilename({}, "image", "image/png"), "response.png");
  assert.equal(responseFilename({}, "json", "application/vnd.api+json"), "response.json");
});
