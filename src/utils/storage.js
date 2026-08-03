const HISTORY_KEY = "lightapi-history";

const COLLECTIONS_KEY = "lightapi-collections";

const ENVIRONMENT_KEY = "lightapi-environment";

/* ==========================================
   HISTORY
========================================== */

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/* ==========================================
   COLLECTIONS
========================================== */

export function loadCollections() {
  try {
    return JSON.parse(localStorage.getItem(COLLECTIONS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCollections(collections) {
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
}

/* ==========================================
   ENVIRONMENT
========================================== */

export function loadEnvironment() {
  try {
    return JSON.parse(localStorage.getItem(ENVIRONMENT_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveEnvironment(environment) {
  localStorage.setItem(ENVIRONMENT_KEY, JSON.stringify(environment));
}
