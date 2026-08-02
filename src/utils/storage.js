const HISTORY_KEY = "lightapi_history";
const COLLECTIONS_KEY = "lightapi_collections";

export const loadHistory = () => {
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveHistory = (history) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const loadCollections = () => {
  const data = localStorage.getItem(COLLECTIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveCollections = (collections) => {
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
};
