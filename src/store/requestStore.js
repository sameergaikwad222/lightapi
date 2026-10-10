import { create } from "zustand";
import { createEmptyRequest } from "../utils/request.js";
import {
  loadHistory,
  saveHistory,
  loadCollections,
  saveCollections,
  loadEnvironment,
  saveEnvironment,
} from "../utils/storage.js";

const MAX_HISTORY = 100;

function createRequestTab(request = {}, source = {}) {
  const defaults = createEmptyRequest();
  const body = request.body ?? "";
  const headers = (request.headers ?? []).map(header => ({ ...header }));

  return {
    ...defaults,
    id: crypto.randomUUID(),
    name: request.name ?? "",
    method: request.method ?? defaults.method,
    url: request.url ?? "",
    params: (request.params ?? []).map(param => ({ ...param })),
    headers,
    body,
    auth: { ...defaults.auth, ...request.auth },
    response: null,
    loading: false,
    activeTab: body ? "body" : headers.length ? "headers" : "params",
    activeResponseTab: "body",
    paramDraft: { key: "", value: "" },
    headerDraft: { key: "", value: "" },
    selectedHistoryId: null,
    selectedCollectionId: null,
    selectedCollectionRequestId: null,
    ...source,
  };
}

// Existing editors read the active request fields; the tab list owns every draft.
function tabState(tabs, activeId) {
  const active = tabs.find(tab => tab.id === activeId) ?? tabs[0];
  const { id, ...fields } = active;
  return { requestTabs: tabs, activeRequestId: id, ...fields };
}

function updateTab(state, id, changes) {
  if (!state.requestTabs.some(tab => tab.id === id)) return state;
  const tabs = state.requestTabs.map(tab => tab.id === id ? { ...tab, ...changes } : tab);
  return tabState(tabs, state.activeRequestId);
}

function openRequest(state, request, source = {}) {
  const existing = state.requestTabs.find(tab =>
    source.selectedCollectionRequestId != null
      ? tab.selectedCollectionId === source.selectedCollectionId &&
        tab.selectedCollectionRequestId === source.selectedCollectionRequestId
      : source.selectedHistoryId != null && tab.selectedHistoryId === source.selectedHistoryId,
  );
  if (existing) return tabState(state.requestTabs, existing.id);
  const tab = createRequestTab(request, source);
  return tabState([...state.requestTabs, tab], tab.id);
}

export function createRequestStore() {
  const firstTab = createRequestTab();

  return create((set) => ({
    ...tabState([firstTab], firstTab.id),
    history: loadHistory(),
    collections: loadCollections(),
    environment: loadEnvironment(),

    newRequest: (request = {}) => set(state => openRequest(state, request)),

    selectRequest: (id) => set(state =>
      state.requestTabs.some(tab => tab.id === id)
        ? tabState(state.requestTabs, id)
        : state,
    ),

    closeRequest: (id) => set(state => {
      const index = state.requestTabs.findIndex(tab => tab.id === id);
      if (index === -1) return state;
      const tabs = state.requestTabs.filter(tab => tab.id !== id);
      if (!tabs.length) tabs.push(createRequestTab());
      const activeId = id === state.activeRequestId
        ? tabs[Math.min(index, tabs.length - 1)].id
        : state.activeRequestId;
      return tabState(tabs, activeId);
    }),

    setMethod: (method) => set(state => updateTab(state, state.activeRequestId, { method })),
    setUrl: (url) => set(state => updateTab(state, state.activeRequestId, { url })),
    setParams: (params) => set(state => updateTab(state, state.activeRequestId, { params })),
    setHeaders: (headers) => set(state => updateTab(state, state.activeRequestId, { headers })),
    setBody: (body) => set(state => updateTab(state, state.activeRequestId, { body })),
    setAuth: (auth) => set(state => updateTab(state, state.activeRequestId, { auth })),
    setActiveTab: (activeTab) => set(state => updateTab(state, state.activeRequestId, { activeTab })),
    setActiveResponseTab: (activeResponseTab) => set(state => updateTab(state, state.activeRequestId, { activeResponseTab })),
    setParamDraft: (paramDraft) => set(state => updateTab(state, state.activeRequestId, { paramDraft })),
    setHeaderDraft: (headerDraft) => set(state => updateTab(state, state.activeRequestId, { headerDraft })),

    // Async callers pass the originating tab ID, even after the user switches tabs.
    setResponse: (response, id) => set(state => updateTab(state, id ?? state.activeRequestId, { response })),
    setLoading: (loading, id) => set(state => updateTab(state, id ?? state.activeRequestId, { loading })),

    markRequestSaved: (id, { name, collectionId, requestId }) => set(state => updateTab(state, id, {
      name,
      selectedCollectionId: collectionId,
      selectedCollectionRequestId: requestId,
      selectedHistoryId: null,
    })),

    setEnvironment: (environment) => {
      saveEnvironment(environment);
      set({ environment });
    },

    getEnvironmentValue: (key) => loadEnvironment().find(item => item.key === key)?.value ?? "",

    addHistory: (request) => set(state => {
      const history = [request, ...state.history.filter(item =>
        item.method !== request.method || item.url !== request.url,
      )].slice(0, MAX_HISTORY);
      saveHistory(history);
      return { history };
    }),

    clearHistory: () => set(state => {
      saveHistory([]);
      const tabs = state.requestTabs.map(tab => ({ ...tab, selectedHistoryId: null }));
      return { history: [], ...tabState(tabs, state.activeRequestId) };
    }),

    loadRequest: (request) => set(state => openRequest(state, request, {
      selectedHistoryId: request.id,
    })),

    addCollection: (name, id = crypto.randomUUID()) => set(state => {
      const collections = [...state.collections, { id, name, requests: [] }];
      saveCollections(collections);
      return { collections };
    }),

    addCollectionRequest: (collectionId, request) => set(state => {
      const collections = state.collections.map(collection => collection.id === collectionId
        ? { ...collection, requests: [...collection.requests, request] }
        : collection,
      );
      saveCollections(collections);
      return { collections };
    }),

    deleteCollection: (id) => set(state => {
      const collections = state.collections.filter(collection => collection.id !== id);
      const tabs = state.requestTabs.map(tab => tab.selectedCollectionId === id
        ? { ...tab, selectedCollectionId: null, selectedCollectionRequestId: null }
        : tab,
      );
      saveCollections(collections);
      return { collections, ...tabState(tabs, state.activeRequestId) };
    }),

    deleteCollectionRequest: (collectionId, requestId) => set(state => {
      const collections = state.collections.map(collection => collection.id === collectionId
        ? { ...collection, requests: collection.requests.filter(request => request.id !== requestId) }
        : collection,
      );
      const tabs = state.requestTabs.map(tab =>
        tab.selectedCollectionId === collectionId && tab.selectedCollectionRequestId === requestId
          ? { ...tab, selectedCollectionId: null, selectedCollectionRequestId: null }
          : tab,
      );
      saveCollections(collections);
      return { collections, ...tabState(tabs, state.activeRequestId) };
    }),

    loadCollection: (request, collectionId) => set(state => openRequest(state, request, {
      selectedCollectionId: collectionId,
      selectedCollectionRequestId: request.id,
    })),
  }));
}

export default createRequestStore();
