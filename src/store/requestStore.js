import { create } from "zustand";

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

  history: [],

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
    set((state) => ({
      history: [request, ...state.history],
    })),
  loadRequest: (request) =>
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
