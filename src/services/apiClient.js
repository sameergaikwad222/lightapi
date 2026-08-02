import axios from "axios";

const apiClient = async ({ method, url, params, headers, body }) => {
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
