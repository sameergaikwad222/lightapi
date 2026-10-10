import test from "node:test";
import assert from "node:assert/strict";
import { prepareRequestBody, createBodyField, fileMetadata, normalizeRequestBody } from "../src/utils/requestBody.js";
import { parseCurl } from "../src/utils/curl.js";

test("raw formats send their content intact with the appropriate MIME type", () => {
  for (const [bodyType, body, mime] of [
    ["json", '"a JSON string"', "application/json"],
    ["json", "false", "application/json"],
    ["xml", '<user name="Ada">&amp;</user>', "application/xml"],
    ["html", "<p>Hello</p>", "text/html"],
    ["text", '{"literal": true}', "text/plain"],
    ["javascript", "console.log('hello');", "application/javascript"],
  ]) {
    const result = prepareRequestBody({ bodyType, body });
    assert.equal(result.data, body);
    assert.equal(result.headers["Content-Type"], mime);
  }
});

test("JSON validation happens after resolving environment variables", () => {
  const request = { bodyType: "json", body: '{"count": {{count}}}' };
  assert.equal(prepareRequestBody(request, {}, value => value.replace("{{count}}", "3")).data, '{"count": 3}');
  assert.throws(() => prepareRequestBody(request), /Invalid JSON/);
  assert.doesNotThrow(() => prepareRequestBody({ bodyType: "xml", body: "<root/>" }));
});

test("URL-encoded forms preserve repeated keys, blank values and special characters", () => {
  const result = prepareRequestBody({ bodyType: "urlencoded", bodyFields: [
    createBodyField("tag", "a&b=c"), createBodyField("tag", "New York ☕"),
    createBodyField("empty", ""), { ...createBodyField("ignored", "no"), enabled: false },
    createBodyField("", "no"), createBodyField("{{key}}", "{{value}}"),
  ] }, {}, value => value.replace("{{key}}", "resolved").replace("{{value}}", "yes"));
  assert.deepEqual(Array.from(new URLSearchParams(result.data)), [
    ["tag", "a&b=c"], ["tag", "New York ☕"], ["empty", ""], ["resolved", "yes"],
  ]);
  assert.equal(result.headers["Content-Type"], "application/x-www-form-urlencoded");
});

test("multipart forms keep files, repeated keys and empty values, and remove manual boundaries", async () => {
  const file = new File([new Uint8Array([0, 255, 13, 10])], "upload.bin", { type: "application/octet-stream" });
  const result = prepareRequestBody({ bodyType: "form-data", bodyFields: [
    createBodyField("tag", "one"), createBodyField("tag", "two"), createBodyField("blank", ""),
    { ...createBodyField("attachment"), type: "file", file, fileMeta: fileMetadata(file) },
    { ...createBodyField("omitted"), type: "file", enabled: false },
  ] }, { "CONTENT-TYPE": "multipart/form-data; boundary=incorrect", "X-Test": "kept" });
  assert.deepEqual(result.data.getAll("tag"), ["one", "two"]);
  assert.equal(result.data.get("blank"), "");
  assert.equal(result.data.has("omitted"), false);
  const upload = result.data.get("attachment");
  assert.equal(upload.name, "upload.bin");
  assert.deepEqual(new Uint8Array(await upload.arrayBuffer()), new Uint8Array([0, 255, 13, 10]));
  assert.deepEqual(result.headers, { "X-Test": "kept" });
});

test("missing uploads and files in URL-encoded forms report useful errors", () => {
  const field = { ...createBodyField("attachment"), type: "file", fileMeta: { name: "photo.jpg" } };
  assert.throws(() => prepareRequestBody({ bodyType: "form-data", bodyFields: [field] }), /Choose a file.*photo.jpg/);
  assert.throws(() => prepareRequestBody({ bodyType: "urlencoded", bodyFields: [field] }), /File uploads require form-data/);
  assert.throws(() => prepareRequestBody({ bodyType: "binary" }), /Choose a file/);
  assert.throws(() => prepareRequestBody({ bodyType: "binary", bodyFileMeta: { name: "photo.jpg" } }), /Select photo.jpg again/);
});

test("binary uploads keep the exact file and allow a custom content type", () => {
  const file = new File(["abc"], "data.txt");
  const result = prepareRequestBody({ bodyType: "binary", bodyFile: file }, { "content-type": "text/custom" });
  assert.equal(result.data, file);
  assert.deepEqual(result.headers, { "content-type": "text/custom" });
});

test("None ignores remembered raw content and uploads without JSON validation", () => {
  const result = prepareRequestBody({ bodyType: "none", body: "invalid JSON", bodyFile: new File(["abc"], "data.txt") },
    { "Content-Type": "application/json", "X-Test": "kept" });
  assert.equal(result.data, undefined);
  assert.deepEqual(result.headers, { "X-Test": "kept" });
});

test("legacy and cURL XML/form requests infer a usable editor and preserve form values", () => {
  const xml = { body: "<root/>", headers: [{ key: "Content-Type", value: "application/soap+xml; charset=utf-8" }] };
  assert.equal(normalizeRequestBody(xml).bodyType, "xml");
  const importedXml = parseCurl("curl https://example.com -H 'Content-Type: text/xml' -d '<root/>'");
  assert.equal(importedXml.bodyType, "xml");
  assert.equal(prepareRequestBody(importedXml).data, "<root/>");
  const form = parseCurl("curl https://example.com -d 'tag=one&tag=two&name=Ada+Lovelace&empty='");
  assert.equal(form.bodyType, "urlencoded");
  assert.deepEqual(Array.from(new URLSearchParams(prepareRequestBody(form).data)), [
    ["tag", "one"], ["tag", "two"], ["name", "Ada Lovelace"], ["empty", ""],
  ]);
});
