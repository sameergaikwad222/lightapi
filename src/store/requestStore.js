import { create } from "zustand";

const useRequestStore = create((set) => ({
  method: "GET",
  url: "",
  response: null,
  loading: false,

  params: [],
  headers: [],
  body: "",

  setMethod: (method) => set({ method }),
  setUrl: (url) => set({ url }),
  setResponse: (response) => set({ response }),
  setLoading: (loading) => set({ loading }),

  setParams: (params) => set({ params }),
  setHeaders: (headers) => set({ headers }),
  setBody: (body) => set({ body }),
}));

export default useRequestStore;
