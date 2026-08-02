import { useMemo } from "react";
import useRequestStore from "../../store/requestStore";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";

import {
  Copy,
  Clock3,
  Database,
  Download,
} from "lucide-react";

function ResponseViewer() {
  const {
    response,
    activeResponseTab,
    setActiveResponseTab,
  } = useRequestStore();

  const prettyBody = useMemo(() => {
    if (!response) return "";
    return JSON.stringify(response.data, null, 2);
  }, [response]);

  const prettyHeaders = useMemo(() => {
    if (!response) return "";
    return JSON.stringify(response.headers, null, 2);
  }, [response]);

  const prettyRaw = useMemo(() => {
    if (!response) return "";
    return JSON.stringify(response, null, 2);
  }, [response]);

  const responseSize = useMemo(() => {
    if (!response) return 0;
    return new Blob([prettyBody]).size;
  }, [prettyBody, response]);

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024)
      return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleCopy = async () => {
    if (!response) return;
    await navigator.clipboard.writeText(prettyBody);
  };

  const handleDownload = () => {
    if (!response) return;

    const blob = new Blob([prettyBody], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "response.json";
    link.click();

    URL.revokeObjectURL(url);
  };

  if (!response) {
    return (
      <div className="response-viewer">
        <div className="response-empty">
          Send a request to view the response.
        </div>
      </div>
    );
  }

  return (
    <div className="response-viewer">

      <div className="response-header">

        <div className="response-meta">

          <span className="status-badge">
            {response.status} {response.statusText}
          </span>

          <span className="meta-badge">
            <Clock3 size={15} />
            {response.time} ms
          </span>

          <span className="meta-badge">
            <Database size={15} />
            {formatBytes(responseSize)}
          </span>

        </div>

        <div className="response-actions">

          <button
            className="copy-btn"
            onClick={handleCopy}
          >
            <Copy size={15} />
            Copy
          </button>

          <button
            className="copy-btn"
            onClick={handleDownload}
          >
            <Download size={15} />
            Download
          </button>

        </div>

      </div>

      <div className="response-tabs">

        <button
          className={activeResponseTab === "body" ? "active" : ""}
          onClick={() => setActiveResponseTab("body")}
        >
          Pretty
        </button>

        <button
          className={activeResponseTab === "headers" ? "active" : ""}
          onClick={() => setActiveResponseTab("headers")}
        >
          Headers
        </button>

        <button
          className={activeResponseTab === "raw" ? "active" : ""}
          onClick={() => setActiveResponseTab("raw")}
        >
          Raw
        </button>

      </div>

      <div className="response-content">

        {activeResponseTab === "body" && (
          <JsonView
            src={response.data}
            theme="atom"
            collapsed={false}
            enableClipboard={false}
            displayDataTypes={false}
            displayObjectSize={false}
          />
        )}

        {activeResponseTab === "headers" && (
          <pre>{prettyHeaders}</pre>
        )}

        {activeResponseTab === "raw" && (
          <pre>{prettyRaw}</pre>
        )}

      </div>

    </div>
  );
}

export default ResponseViewer;