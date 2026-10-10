import apiClient, { prepareBody } from "../../services/apiClient";
import useRequestStore from "../../store/requestStore";
import { useState, useMemo, useEffect, useRef } from "react";
import SaveRequestModal from "../SaveRequestModal/SaveRequestModal";
import Button from "../ui/Button/Button";
import Input from "../ui/Input/Input";
import { Send, Save } from "lucide-react";
import { REQUEST_METHODS } from "../../utils/request";

function RequestBar() {
  const {
    method,
    url,
    params,
    headers,
    body,
    bodyType,
    bodyFields,
    bodyFile,
    bodyFileMeta,
    auth,
    loading,
    activeRequestId,
    history,
    collections,
    addHistory,
    addCollection,
    addCollectionRequest,
    setMethod,
    setUrl,
    setResponse,
    setLoading,
    setBodyError,
    setActiveTab,
    markRequestSaved,
  } = useRequestStore();

  const [showSaveModal, setShowSaveModal] = useState(false);

  const [showSuggestions, setShowSuggestions] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState(-1);

  const wrapperRef = useRef(null);

  const suggestions = useMemo(() => {
    const urls = [
      ...history.map((item) => item.url),
      ...collections.flatMap((collection) =>
        collection.requests.map((item) => item.url),
      ),
    ]
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index);

    if (!url.trim()) {
      return urls.slice(0, 10);
    }

    return urls
      .filter((item) => item.toLowerCase().includes(url.toLowerCase()))
      .slice(0, 10);
  }, [url, history, collections]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectSuggestion = (value) => {
    setUrl(value);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleUrlKeyDown = (event) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();

        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0,
        );
        break;

      case "ArrowUp":
        event.preventDefault();

        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1,
        );
        break;

      case "Enter":
        if (selectedIndex >= 0) {
          event.preventDefault();
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;

      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;

      default:
        break;
    }
  };
  const handleSend = async () => {
    if (!url.trim() || loading) return;

    const request = { method, url, params, headers, body, bodyType, bodyFields, bodyFile, bodyFileMeta, auth };
    try {
      prepareBody(request);
    } catch (err) {
      setBodyError(err.message);
      setActiveTab("body");
      return;
    }
    setBodyError("");

    const requestId = activeRequestId;
    setLoading(true, requestId);

    try {
      const response = await apiClient(request);

      setResponse(response, requestId);

      addHistory({
        id: crypto.randomUUID(),
        ...request,
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

      setResponse(errorResponse, requestId);

      addHistory({
        id: crypto.randomUUID(),
        ...request,
        status: errorResponse.status,
        time: errorResponse.time,
      });
    } finally {
      setLoading(false, requestId);
    }
  };

  const handleSave = ({ collectionId, collectionName, requestName }) => {
    let targetCollectionId = collectionId;

    if (!targetCollectionId) {
      targetCollectionId = crypto.randomUUID();
      addCollection(collectionName, targetCollectionId);
    }

    const savedRequestId = crypto.randomUUID();
    addCollectionRequest(targetCollectionId, {
      id: savedRequestId,
      name: requestName,
      method,
      url,
      params,
      headers,
      body,
      bodyType,
      bodyFields,
      bodyFile,
      bodyFileMeta,
      auth,
    });
    markRequestSaved(activeRequestId, {
      name: requestName,
      collectionId: targetCollectionId,
      requestId: savedRequestId,
    });
    setShowSaveModal(false);
  };

  return (
    <div className="request-bar">
      <select
        className="method-select"
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        disabled={loading}
      >
        {REQUEST_METHODS.map(value => <option key={value} value={value}>{value}</option>)}
      </select>

      <div className="url-autocomplete" ref={wrapperRef}>
        <Input
          id="request-url"
          className="url-input"
          type="text"
          placeholder="Enter request URL..."
          value={url}
          autoComplete="off"
          disabled={loading}
          onChange={(e) => {
            setUrl(e.target.value);
            setShowSuggestions(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onKeyDown={handleUrlKeyDown}
        />

        {showSuggestions && suggestions.length > 0 && (
          <div className="autocomplete-dropdown">
            {suggestions.map((item, index) => (
              <div
                key={item}
                className={`autocomplete-item ${
                  index === selectedIndex ? "active" : ""
                }`}
                onMouseDown={() => selectSuggestion(item)}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>

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
          collections={collections}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSave}
        />
      </>
    </div>
  );
}

export default RequestBar;
