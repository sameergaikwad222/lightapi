import axios from "axios";

const apiClient = async ({ method, url, params, headers, body, auth }) => {
  const startTime = performance.now();

  const queryParams = {};
  params.forEach((param) => {
    if (param.key.trim()) {
      queryParams[param.key] = param.value;
    }
  });

  const requestHeaders = {};
  headers.forEach((header) => {
    if (header.key.trim()) {
      requestHeaders[header.key] = header.value;
    }
  });

  if (auth.type === "bearer" && auth.token.trim()) {
    requestHeaders.Authorization = `Bearer ${auth.token}`;
  }

  if (auth.type === "basic") {
    requestHeaders.Authorization =
      "Basic " + btoa(`${auth.username}:${auth.password}`);
  }

  if (auth.type === "apikey") {
    if (auth.apiLocation === "header") {
      requestHeaders[auth.apiKey] = auth.apiValue;
    }

    if (auth.apiLocation === "query") {
      queryParams[auth.apiKey] = auth.apiValue;
    }
  }

  let requestBody;

  if (body.trim()) {
    requestBody = JSON.parse(body);
  }

  const response = await axios({
    method,
    url,
    params: queryParams,
    headers: requestHeaders,
    data: requestBody,
  });

  const endTime = performance.now();

  return {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    data: response.data,
    time: Math.round(endTime - startTime),
  };
};

export default apiClient;
