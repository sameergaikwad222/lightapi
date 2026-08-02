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
  },

  setMethod: (method) => set({ method }),
  setUrl: (url) => set({ url }),
  setResponse: (response) => set({ response }),
  setLoading: (loading) => set({ loading }),

  setActiveTab: (activeTab) => set({ activeTab }),

  setParams: (params) => set({ params }),
  setHeaders: (headers) => set({ headers }),
  setBody: (body) => set({ body }),

  setAuth: (auth) => set({ auth }),
}));

export default useRequestStore;
