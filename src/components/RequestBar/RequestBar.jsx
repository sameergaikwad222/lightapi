import apiClient from "../../services/apiClient";
import useRequestStore from "../../store/requestStore";
import { useState } from "react";
import SaveRequestModal from "../SaveRequestModal/SaveRequestModal";
import Button from "../ui/Button/Button";
import Input from "../ui/Input/Input";
import { Send, Save } from "lucide-react";

function RequestBar() {
  const {
    method,
    url,
    params,
    headers,
    body,
    auth,
    loading,
    addHistory,
    addCollection,
    setMethod,
    setUrl,
    setResponse,
    setLoading,
  } = useRequestStore();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const handleSend = async () => {
    if (!url.trim() || loading) return;

    try {
      if (body.trim()) {
        JSON.parse(body);
      }
    } catch (err) {
      alert("Invalid JSON Body", err.message);
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient({
        method,
        url,
        params,
        headers,
        body,
        auth,
      });

      setResponse(response);

      addHistory({
        id: Date.now(),
        method,
        url,
        params,
        headers,
        body,
        auth,
        status: response.status,
        time: response.time,
      });
    } catch (error) {
      const errorResponse = {
        status: error.response?.status || 0,
        statusText: error.response?.statusText || "Request Failed",
        headers: error.response?.headers || {},
        data: error.response?.data || {
          message: error.message,
        },
        time: 0,
      };

      setResponse(errorResponse);

      addHistory({
        id: Date.now(),
        method,
        url,
        params,
        headers,
        body,
        auth,
        status: errorResponse.status,
        time: errorResponse.time,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (name) => {
    addCollection({
      id: Date.now(),
      name,
      method,
      url,
      params,
      headers,
      body,
      auth,
    });
    setShowSaveModal(false);
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

      <Input
        type="text"
        placeholder="Enter API URL..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={loading}
      />

      <>
        <Button onClick={handleSend} disabled={loading}>
          <Send size={16} />

          {loading ? "Sending..." : "Send"}
        </Button>

        <Button variant="secondary" onClick={() => setShowSaveModal(true)}>
          <Save size={16} />
          Save
        </Button>
        <SaveRequestModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSave}
        />
      </>
    </div>
  );
}

export default RequestBar;
