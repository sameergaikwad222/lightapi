export const REQUEST_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

export function createEmptyRequest() {
  return {
    method: "GET",
    url: "",
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
  };
}

export function isJsonContentType(contentType = "") {
  return !contentType || /^\s*application\/(?:[\w.-]+\+)?json(?:\s*;|$)/i.test(contentType);
}
