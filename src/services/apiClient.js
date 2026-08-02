import axios from "axios";

const apiClient = async ({ method, url }) => {
  const startTime = performance.now();

  const response = await axios({
    method,
    url,
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
