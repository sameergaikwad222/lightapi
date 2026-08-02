import { create } from "zustand";
import {
  loadHistory,
  saveHistory,
  loadCollections,
  saveCollections,
} from "../utils/storage";

const useRequestStore = create((set) => ({
  method: "GET",
  url: "",
  response: null,
  loading: false,

  activeTab: "params",

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

  history: loadHistory(),
  collections: loadCollections(),

  setMethod: (method) => set({ method }),
  setUrl: (url) => set({ url }),
  setResponse: (response) => set({ response }),
  setLoading: (loading) => set({ loading }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setParams: (params) => set({ params }),
  setHeaders: (headers) => set({ headers }),
  setBody: (body) => set({ body }),
  setAuth: (auth) => set({ auth }),

  addHistory: (request) =>
    set((state) => {
      const history = [request, ...state.history];

      saveHistory(history);

      return { history };
    }),
  loadRequest: (request) =>
    set({
      method: request.method,
      url: request.url,
      params: request.params,
      headers: request.headers,
      body: request.body,
      auth: request.auth,
    }),
  addCollection: (request) =>
    set((state) => {
      const collections = [...state.collections, request];

      saveCollections(collections);

      return { collections };
    }),
  deleteCollection: (id) =>
    set((state) => {
      const collections = state.collections.filter((item) => item.id !== id);

      saveCollections(collections);

      return { collections };
    }),
  loadCollection: (request) =>
    set({
      method: request.method,
      url: request.url,
      params: request.params,
      headers: request.headers,
      body: request.body,
      auth: request.auth,
    }),
}));

export default useRequestStore;
