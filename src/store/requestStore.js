import { create } from "zustand";

import {
  loadHistory,
  saveHistory,
  loadCollections,
  saveCollections,
  loadEnvironment,
  saveEnvironment,
} from "../utils/storage";

const MAX_HISTORY = 100;

const useRequestStore = create((set) => ({
  /* ==========================================
     REQUEST
  ========================================== */

  method: "GET",

  url: "",

  response: null,

  loading: false,

  activeTab: "params",

  activeResponseTab: "body",

  params: [],

  headers: [],

  body: "",

  auth: {
    type: "none",
    token: "",
    username: "",
    password: "",
    apiKey: "",
    apiValue: "",
    apiLocation: "header",
  },

  /* ==========================================
     SIDEBAR
  ========================================== */

  selectedHistoryId: null,

  selectedCollectionId: null,

  /* ==========================================
     STORAGE
  ========================================== */

  history: loadHistory(),

  collections: loadCollections(),

  environment: loadEnvironment(),

  /* ==========================================
     REQUEST SETTERS
  ========================================== */

  setMethod: (method) => set({ method }),

  setUrl: (url) => set({ url }),

  setResponse: (response) => set({ response }),

  setLoading: (loading) => set({ loading }),

  setActiveTab: (activeTab) => set({ activeTab }),

  setParams: (params) => set({ params }),

  setHeaders: (headers) => set({ headers }),

  setBody: (body) => set({ body }),

  setAuth: (auth) => set({ auth }),

  setActiveResponseTab: (tab) =>
    set({
      activeResponseTab: tab,
    }),

  /* ==========================================
     ENVIRONMENT
  ========================================== */

  setEnvironment: (environment) => {
    saveEnvironment(environment);

    set({
      environment,
    });
  },

  getEnvironmentValue: (key) => {
    const vars = loadEnvironment();

    const variable = vars.find((item) => item.key === key);

    return variable ? variable.value : "";
  },

  /* ==========================================
     HISTORY
  ========================================== */

  addHistory: (request) =>
    set((state) => {
      const duplicate = state.history.findIndex(
        (item) => item.method === request.method && item.url === request.url,
      );

      let history = [...state.history];

      if (duplicate !== -1) {
        history.splice(duplicate, 1);
      }

      history.unshift(request);

      history = history.slice(0, MAX_HISTORY);

      saveHistory(history);

      return {
        history,
      };
    }),

  clearHistory: () =>
    set(() => {
      saveHistory([]);

      return {
        history: [],
        selectedHistoryId: null,
      };
    }),

  loadRequest: (request) =>
    set({
      method: request.method,
      url: request.url,
      params: request.params,
      headers: request.headers,
      body: request.body,
      auth: request.auth,
      selectedHistoryId: request.id,
      selectedCollectionId: null,
    }),

  /* ==========================================
     COLLECTIONS
  ========================================== */

  addCollection: (request) =>
    set((state) => {
      const collections = [...state.collections, request];

      saveCollections(collections);

      return {
        collections,
      };
    }),

  deleteCollection: (id) =>
    set((state) => {
      const collections = state.collections.filter((item) => item.id !== id);

      saveCollections(collections);

      return {
        collections,
      };
    }),

  loadCollection: (request) =>
    set({
      method: request.method,
      url: request.url,
      params: request.params,
      headers: request.headers,
      body: request.body,
      auth: request.auth,
      selectedCollectionId: request.id,
      selectedHistoryId: null,
    }),
}));

export default useRequestStore;
