import useRequestStore from "../../store/requestStore";
import { JsonView, allExpanded } from "react-json-view-lite";

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

  return (
    <div className="response-viewer">
      <div className="response-header">
        <div className="response-meta">
          <span className="status-badge">
            {response.status} {response.statusText}
          </span>

          <span>{response.time} ms</span>

          <span>JSON</span>
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
