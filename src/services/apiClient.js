import axios from "axios";

const apiClient = async ({ method, url, params }) => {
  const startTime = performance.now();

  const queryParams = {};

  params.forEach((param) => {
    if (param.key.trim()) {
      queryParams[param.key] = param.value;
    }
  });

  const response = await axios({
    method,
    url,
    params: queryParams,
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
