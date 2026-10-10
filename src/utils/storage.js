import { bodyStorageReplacer } from "./requestBody.js";

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
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history, bodyStorageReplacer));
}

/* ==========================================
   COLLECTIONS
========================================== */

export function loadCollections() {
  try {
    const collections = JSON.parse(
      localStorage.getItem(COLLECTIONS_KEY) || "[]",
    );

    if (
      collections.length > 0 &&
      collections.every((collection) => Array.isArray(collection.requests))
    ) {
      return collections;
    }

    if (collections.length === 0) {
      return [];
    }

    return [
      {
        id: `collection-${Date.now()}`,
        name: "My APIs",
        requests: collections,
      },
    ];
  } catch {
    return [];
  }
}

export function saveCollections(collections) {
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections, bodyStorageReplacer));
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
