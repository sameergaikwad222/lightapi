import useRequestStore from "../../store/requestStore";
import { JsonView, allExpanded } from "react-json-view-lite";
import { Copy, Clock3, Database, Download } from "lucide-react";

import "react-json-view-lite/dist/index.css";

function ResponseViewer() {
  const { response, activeResponseTab, setActiveResponseTab } =
    useRequestStore();

  if (!response) {
    return (
      <div className="response-viewer">
        <div className="response-empty">
          Send a request to view the response.
        </div>
      </div>
    );
  }

  const responseSize = new Blob([JSON.stringify(response.data, null, 2)]).size;

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;

    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(response.data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "response.json";

    link.click();

    URL.revokeObjectURL(url);
  };

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
          <button className="copy-btn" onClick={handleCopy}>
            <Copy size={15} />
            Copy
          </button>

          <button className="copy-btn" onClick={handleDownload}>
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
          Body
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
          <div className="json-container">
            <JsonView data={response.data} shouldExpandNode={allExpanded} />
          </div>
        )}

        {activeResponseTab === "headers" && (
          <JsonView data={response.headers} shouldExpandNode={allExpanded} />
        )}

        {activeResponseTab === "raw" && (
          <JsonView data={response} shouldExpandNode={allExpanded} />
        )}
      </div>
    </div>
  );
}

export default ResponseViewer;
