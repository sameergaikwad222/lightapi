import test from "node:test";
import assert from "node:assert/strict";
import { parseCurl } from "../src/utils/curl.js";
import { createEmptyRequest, isJsonContentType } from "../src/utils/request.js";

test("imports a GET and preserves repeated query parameters and fragments", () => {
  const request = parseCurl("curl 'https://example.com/users?tag=a&tag=b#section'");
  assert.equal(request.url, "https://example.com/users?tag=a&tag=b#section");
  assert.equal(request.method, "GET");
  assert.deepEqual(request.params, []);
  assert.equal(request.body, "");
});

test("imports a multiline browser command with headers and a JSON body", () => {
  const request = parseCurl(`curl 'https://example.com/users' \\
    -H 'Content-Type: application/json' \\
    -H 'Authorization: Bearer example-token' \\
    --data-raw '{"name":"Ada","active":true}' --compressed`);
  assert.equal(request.method, "POST");
  assert.equal(request.body, '{"name":"Ada","active":true}');
  assert.deepEqual(request.headers, [
    { key: "Content-Type", value: "application/json" },
    { key: "Authorization", value: "Bearer example-token" },
  ]);
});

test("supports attached short options and long options with equals", () => {
  const request = parseCurl('curl --url=https://example.com -XPATCH -H"X-Test: yes" --data-raw=hello');
  assert.equal(request.method, "PATCH");
  assert.equal(request.body, "hello");
  assert.equal(request.headers[0].value, "yes");
});

test("preserves escaping in double quoted JSON and empty header values", () => {
  const request = parseCurl(String.raw`curl "https://example.com" -H "Content-Type: application/json" -H 'X-Empty:' -d "{\"path\":\"C:\\\\tmp\",\"name\":\"Ada\"}"`);
  assert.deepEqual(JSON.parse(request.body), { path: "C:\\tmp", name: "Ada" });
  assert.equal(request.headers.find(h => h.key === "X-Empty").value, "");
});

test("supports ANSI quoted browser bodies and quoted apostrophes", () => {
  const request = parseCurl(String.raw`curl https://example.com --data-raw $'line1\nO\'Brien\t\x41\u0042'`);
  assert.equal(request.body, "line1\nO'Brien\tAB");
  assert.equal(parseCurl(String.raw`curl https://example.com -d 'O'\''Brien'`).body, "O'Brien");
});

test("preserves literal backslashes inside single quotes", () => {
  const body = '{"path":"C:\\\\tmp"}';
  assert.equal(parseCurl(`curl https://example.com --data-raw '${body}'`).body, body);
});

test("supports Windows and PowerShell multiline continuations", () => {
  for (const marker of ["^", "`"]) {
    const request = parseCurl(`curl.exe "https://example.com" ${marker}\r\n -X PUT`);
    assert.equal(request.method, "PUT");
  }
});

test("infers POST for an empty data argument and merges form data", () => {
  assert.equal(parseCurl("curl https://example.com -d ''").method, "POST");
  const request = parseCurl("curl https://example.com -d name=Ada --data-urlencode 'city=New York'");
  assert.equal(request.body, "name=Ada&city=New%20York");
  assert.equal(request.headers[0].value, "application/x-www-form-urlencoded");
});

test("moves GET data to the URL without losing existing queries or fragments", () => {
  const request = parseCurl("curl -G 'https://example.com?first=1#part' --data-urlencode 'q=two words'");
  assert.equal(request.url, "https://example.com?first=1&q=two%20words#part");
  assert.equal(request.method, "GET");
  assert.equal(request.body, "");
});

test("supports JSON shorthand and repeated JSON chunks", () => {
  const request = parseCurl(`curl https://example.com --json '{"name":' --json '"Ada"}'`);
  assert.equal(request.body, '{"name":"Ada"}');
  assert.deepEqual(request.headers, [
    { key: "Content-Type", value: "application/json" },
    { key: "Accept", value: "application/json" },
  ]);
});

test("explicit headers override defaults regardless of casing", () => {
  const request = parseCurl(`curl https://example.com --json '{}' -H 'accept: text/plain' -H 'Content-Type: text/plain' -H 'CONTENT-TYPE: application/problem+json'`);
  assert.deepEqual(request.headers, [
    { key: "accept", value: "text/plain" },
    { key: "CONTENT-TYPE", value: "application/problem+json" },
  ]);
});

test("supports basic and bearer authentication and inline cookies", () => {
  const request = parseCurl("curl -u 'user:pass:word' https://example.com -b 'session=example; theme=dark'");
  assert.equal(request.auth.type, "basic");
  assert.equal(request.auth.username, "user");
  assert.equal(request.auth.password, "pass:word");
  assert.equal(request.headers[0].key, "Cookie");
  assert.equal(parseCurl("curl https://example.com --oauth2-bearer example-token").auth.token, "example-token");
});

test("supports HEAD, OPTIONS, output flags and base URL variables", () => {
  assert.equal(parseCurl("curl -sSL -I https://example.com").method, "HEAD");
  assert.equal(parseCurl("curl --request OPTIONS '{{baseUrl}}/users'").method, "OPTIONS");
  assert.equal(parseCurl("curl 'https://{{host}}/users?token={{token}}'").url, "https://{{host}}/users?token={{token}}");
});

test("an explicit authorization header takes precedence over auth flags", () => {
  const request = parseCurl("curl https://example.com -u user:password -H 'Authorization: Bearer example-token'");
  assert.equal(request.auth.type, "none");
  assert.equal(request.headers[0].value, "Bearer example-token");
});

test("raw data can start with @ without being treated as a file", () => {
  assert.equal(parseCurl("curl https://example.com --data-raw '@literal'").body, "@literal");
});

test("rejects malformed commands and unsupported inputs instead of partially importing", () => {
  for (const command of [
    "", "wget https://example.com", "curl", "curl https://", "curl ftp://example.com",
    "curl 'https://example.com", "curl https://example.com -H", "curl https://example.com -H bad",
    "curl https://example.com --data @body.json", "curl https://example.com --header @headers.txt",
    "curl https://example.com --data-urlencode name@file", "curl https://example.com --cookie cookies.txt",
    "curl https://example.com --form file=@upload.png", "curl https://example.com --data-unknown value",
    "curl https://example.com https://other.example.com", "curl https://example.com -X TRACE",
    "curl https://example.com -I -d data", "curl https://example.com | other-command",
  ]) assert.throws(() => parseCurl(command), Error, command);
});

test("fresh drafts have independent arrays and authentication objects", () => {
  const first = createEmptyRequest();
  first.headers.push({ key: "X-Test", value: "yes" });
  first.auth.token = "example";
  assert.deepEqual(createEmptyRequest().headers, []);
  assert.equal(createEmptyRequest().auth.token, "");
});

test("detects JSON bodies without classifying forms or text as JSON", () => {
  for (const value of [undefined, "", "application/json", "application/problem+json; charset=utf-8"]) {
    assert.equal(isJsonContentType(value), true);
  }
  for (const value of ["text/plain", "application/x-www-form-urlencoded", "application/jsonp", "application/json-other"]) {
    assert.equal(isJsonContentType(value), false);
  }
});
