import apiClient from "../../services/apiClient";
import useRequestStore from "../../store/requestStore";

function RequestBar() {
const {
  method,
  url,
  params,
  headers,
  loading,
  setMethod,
  setUrl,
  setResponse,
  setLoading,
} = useRequestStore();

  const handleSend = async () => {
    if (!url.trim() || loading) return;

    setLoading(true);

    try {
      const response = await apiClient({ method, url, params, headers });
      setResponse(response);
    } catch (error) {
      setResponse({
        status: error.response?.status || 0,
        statusText: error.response?.statusText || "Request Failed",
        headers: error.response?.headers || {},
        data: error.response?.data || {
          message: error.message,
        },
        time: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="request-bar">
      <select
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        disabled={loading}
      >
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="PATCH">PATCH</option>
        <option value="DELETE">DELETE</option>
      </select>

      <input
        type="text"
        placeholder="https://api.example.com/users"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={loading}
      />

      <button onClick={handleSend} disabled={loading}>
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
}

export default RequestBar;