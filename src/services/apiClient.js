import axios from "axios";
import useRequestStore from "../store/requestStore";

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

const apiClient = async ({ method, url, params, headers, body, auth }) => {
  const startTime = performance.now();

  const queryParams = {};

  params.forEach((param) => {
    if (param.key.trim()) {
      queryParams[param.key] = resolveVariables(param.value);
    }
  });

  const requestHeaders = {};

  headers.forEach((header) => {
    if (header.key.trim()) {
      requestHeaders[header.key] = resolveVariables(header.value);
    }
  });

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

  let requestBody;

  if (body.trim()) {
    const resolvedBody = resolveVariables(body);

    try {
      requestBody = JSON.parse(resolvedBody);
    } catch {
      requestBody = resolvedBody;
    }
  }

  const response = await axios({
    method,
    url: resolveVariables(url),
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
