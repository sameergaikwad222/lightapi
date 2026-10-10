import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createEmptyRequest } from "../src/utils/request.js";
import { parseCurl } from "../src/utils/curl.js";

const storage = new Map();
globalThis.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
};
const { createRequestStore } = await import("../src/store/requestStore.js");
beforeEach(() => storage.clear());

test("new requests and cURL imports open independent tabs without clearing the old draft", () => {
  const store = createRequestStore();
  const firstId = store.getState().activeRequestId;
  store.getState().setUrl("https://example.com/first");
  store.getState().setResponse({ status: 200, data: "first" });
  store.getState().newRequest(parseCurl("curl https://example.com/second --json '{}'"));
  assert.equal(store.getState().requestTabs.length, 2);
  assert.equal(store.getState().method, "POST");
  assert.equal(store.getState().body, "{}");
  assert.equal(store.getState().response, null);
  store.getState().selectRequest(firstId);
  assert.equal(store.getState().url, "https://example.com/first");
  assert.equal(store.getState().response.data, "first");
});

test("switching restores all draft fields, editor selections and pending input fields", () => {
  const store = createRequestStore();
  const firstId = store.getState().activeRequestId;
  const state = store.getState();
  state.setMethod("PATCH");
  state.setUrl("https://example.com/first");
  state.setParams([{ key: "q", value: "one" }]);
  state.setHeaders([{ key: "X-Test", value: "first" }]);
  state.setBody('{"first":true}');
  state.setAuth({ ...state.auth, type: "bearer", token: "first-token" });
  state.setActiveTab("auth");
  state.setActiveResponseTab("raw");
  state.setParamDraft({ key: "pending", value: "first" });
  state.setHeaderDraft({ key: "X-Pending", value: "first" });
  const snapshot = store.getState().requestTabs[0];
  state.newRequest();
  assert.equal(store.getState().auth.type, "none");
  assert.deepEqual(store.getState().headerDraft, { key: "", value: "" });
  state.setUrl("https://example.com/second");
  state.setActiveTab("headers");
  state.selectRequest(firstId);
  for (const key of ["method", "url", "params", "headers", "body", "auth", "activeTab", "activeResponseTab", "paramDraft", "headerDraft"]) {
    assert.deepEqual(store.getState()[key], snapshot[key], key);
  }
});

test("concurrent requests update only their originating tab", () => {
  const store = createRequestStore();
  const firstId = store.getState().activeRequestId;
  store.getState().setLoading(true, firstId);
  store.getState().newRequest();
  const secondId = store.getState().activeRequestId;
  assert.equal(store.getState().loading, false);
  store.getState().setLoading(true, secondId);
  store.getState().setResponse({ status: 200, data: "first" }, firstId);
  store.getState().setLoading(false, firstId);
  assert.equal(store.getState().response, null);
  assert.equal(store.getState().loading, true);
  store.getState().setResponse({ status: 500, data: "second error" }, secondId);
  store.getState().setLoading(false, secondId);
  store.getState().selectRequest(firstId);
  assert.equal(store.getState().response.data, "first");
  assert.equal(store.getState().loading, false);
  store.getState().selectRequest(secondId);
  assert.equal(store.getState().response.status, 500);
});

test("late responses from closed tabs are ignored and cannot reopen or overwrite a tab", () => {
  const store = createRequestStore();
  const closedId = store.getState().activeRequestId;
  store.getState().setLoading(true, closedId);
  store.getState().closeRequest(closedId);
  const currentId = store.getState().activeRequestId;
  assert.notEqual(currentId, closedId);
  store.getState().setResponse({ data: "late" }, closedId);
  store.getState().setLoading(false, closedId);
  assert.equal(store.getState().requestTabs.length, 1);
  assert.equal(store.getState().activeRequestId, currentId);
  assert.equal(store.getState().response, null);
});

test("closing active and inactive tabs chooses a neighbor and keeps at least one blank tab", () => {
  const store = createRequestStore();
  const firstId = store.getState().activeRequestId;
  store.getState().newRequest();
  const middleId = store.getState().activeRequestId;
  store.getState().newRequest();
  const lastId = store.getState().activeRequestId;
  store.getState().selectRequest(middleId);
  store.getState().closeRequest(middleId);
  assert.equal(store.getState().activeRequestId, lastId);
  store.getState().closeRequest(firstId);
  assert.equal(store.getState().activeRequestId, lastId);
  store.getState().closeRequest(lastId);
  assert.equal(store.getState().requestTabs.length, 1);
  assert.equal(store.getState().url, "");
  assert.equal(store.getState().method, "GET");
  const finalId = store.getState().activeRequestId;
  store.getState().selectRequest("unknown");
  store.getState().closeRequest("unknown");
  assert.equal(store.getState().activeRequestId, finalId);
});

test("opening the same saved request reuses its tab and preserves edits and response", () => {
  const store = createRequestStore();
  const saved = { ...createEmptyRequest(), id: "saved", name: "Saved request", url: "https://example.com/saved" };
  store.getState().loadCollection(saved, "folder");
  const savedTabId = store.getState().activeRequestId;
  store.getState().setBody("draft changes");
  store.getState().setResponse({ data: "saved response" });
  store.getState().newRequest();
  const count = store.getState().requestTabs.length;
  store.getState().loadCollection(saved, "folder");
  assert.equal(store.getState().requestTabs.length, count);
  assert.equal(store.getState().activeRequestId, savedTabId);
  assert.equal(store.getState().body, "draft changes");
  assert.equal(store.getState().response.data, "saved response");
});

test("history requests open new tabs and repeated clicks reuse the tab", () => {
  const store = createRequestStore();
  const history = { ...createEmptyRequest(), id: 123, method: "DELETE", url: "https://example.com/users/1" };
  store.getState().setUrl("https://example.com/existing");
  store.getState().loadRequest(history);
  assert.equal(store.getState().requestTabs.length, 2);
  const historyTabId = store.getState().activeRequestId;
  store.getState().newRequest();
  store.getState().loadRequest(history);
  assert.equal(store.getState().requestTabs.length, 3);
  assert.equal(store.getState().activeRequestId, historyTabId);
  assert.equal(store.getState().selectedHistoryId, 123);
});

test("editing a saved request tab cannot mutate the saved request", () => {
  const store = createRequestStore();
  const saved = { ...createEmptyRequest(), id: "saved", headers: [{ key: "X-Test", value: "saved" }], params: [{ key: "q", value: "saved" }] };
  const original = structuredClone(saved);
  store.getState().loadCollection(saved, "folder");
  assert.notEqual(store.getState().auth, saved.auth);
  assert.notEqual(store.getState().headers[0], saved.headers[0]);
  assert.notEqual(store.getState().params[0], saved.params[0]);
  store.getState().setHeaders([{ key: "X-Test", value: "edited" }]);
  store.getState().setAuth({ ...saved.auth, token: "edited" });
  assert.deepEqual(saved, original);
});

test("saving names the tab and opening the saved request reuses it", () => {
  const store = createRequestStore();
  const tabId = store.getState().activeRequestId;
  store.getState().markRequestSaved(tabId, { name: "My API", collectionId: "folder", requestId: "saved" });
  assert.equal(store.getState().requestTabs[0].name, "My API");
  store.getState().loadCollection({ ...createEmptyRequest(), id: "saved" }, "folder");
  assert.equal(store.getState().requestTabs.length, 1);
  assert.equal(store.getState().activeRequestId, tabId);
});

test("deleting a collection clears saved selections across its tabs but preserves drafts", () => {
  const store = createRequestStore();
  store.getState().addCollection("Folder", "folder");
  for (const id of ["one", "two"]) {
    const saved = { ...createEmptyRequest(), id, url: `https://example.com/${id}` };
    store.getState().addCollectionRequest("folder", saved);
    store.getState().loadCollection(saved, "folder");
  }
  store.getState().deleteCollection("folder");
  assert.equal(store.getState().requestTabs.length, 3);
  assert.equal(store.getState().url, "https://example.com/two");
  for (const tab of store.getState().requestTabs) {
    assert.equal(tab.selectedCollectionId, null);
    assert.equal(tab.selectedCollectionRequestId, null);
  }
  assert.deepEqual(JSON.parse(storage.get("lightapi-collections")), []);
});

test("clearing history leaves open history drafts intact and removes stale selections", () => {
  const store = createRequestStore();
  const entry = { ...createEmptyRequest(), id: "one", url: "https://example.com/history" };
  store.getState().addHistory(entry);
  store.getState().loadRequest(entry);
  store.getState().newRequest();
  store.getState().clearHistory();
  assert.equal(store.getState().requestTabs[1].url, entry.url);
  assert.equal(store.getState().requestTabs[1].selectedHistoryId, null);
  assert.equal(store.getState().history.length, 0);
});
