import axios from "axios";
import useRequestStore from "../store/requestStore";
import { prepareRequestBody } from "../utils/requestBody";
import { normalizeResponse } from "../utils/response";

function resolveVariables(value) {
  if (!value || typeof value !== "string") {
    return value;
  }

  const { environment } = useRequestStore.getState();

  return value.replace(/\{\{(.*?)\}\}/g, (_, variable) => {
    const env = environment.find((item) => item.key.trim() === variable.trim());

    return env ? env.value : `{{${variable}}}`;
  });
}

export function prepareBody(request) {
  const headers = {};
  request.headers.forEach(header => {
    if (header.key.trim()) headers[header.key.trim()] = resolveVariables(header.value);
  });
  return prepareRequestBody(request, headers, resolveVariables);
}

const apiClient = async (request) => {
  const { method, url, params, auth } = request;
  const startTime = performance.now();

  const queryParams = {};

  params.forEach((param) => {
    if (param.key.trim()) {
      queryParams[param.key] = resolveVariables(param.value);
    }
  });

  const { data: requestBody, headers: requestHeaders } = prepareBody(request);

  if (auth.type === "bearer" && auth.token.trim()) {
    requestHeaders.Authorization = `Bearer ${resolveVariables(auth.token)}`;
  }

  if (auth.type === "basic") {
    requestHeaders.Authorization =
      "Basic " +
      btoa(
        `${resolveVariables(auth.username)}:${resolveVariables(auth.password)}`,
      );
  }

  if (auth.type === "apikey") {
    if (auth.apiLocation === "header") {
      requestHeaders[auth.apiKey] = resolveVariables(auth.apiValue);
    }

    if (auth.apiLocation === "query") {
      queryParams[auth.apiKey] = resolveVariables(auth.apiValue);
    }
  }

  const response = await axios({
    method,
    url: resolveVariables(url),
    params: queryParams,
    headers: requestHeaders,
    data: requestBody,
    transformRequest: [(data) => data],
    responseType: "blob",
    transformResponse: [(data) => data],
    validateStatus: () => true,
  });

  const endTime = performance.now();

  return normalizeResponse(response, Math.round(endTime - startTime));
};

export default apiClient;
