import { useEffect } from "react";
import { LoaderCircle, Plus, X } from "lucide-react";
import useRequestStore from "../../store/requestStore";

function requestTitle(request) {
  if (request.name) return request.name;
  if (!request.url.trim()) return "Untitled request";
  try {
    const url = new URL(request.url);
    return url.pathname === "/" ? url.host : url.pathname;
  } catch {
    return request.url;
  }
}

function RequestWorkspaceTabs() {
  const { requestTabs, activeRequestId, selectRequest, closeRequest, newRequest } = useRequestStore();

  useEffect(() => {
    document.getElementById(`request-tab-${activeRequestId}`)?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }, [activeRequestId]);

  const handleClose = (id) => {
    closeRequest(id);
    requestAnimationFrame(() => {
      const active = useRequestStore.getState().activeRequestId;
      document.getElementById(`request-tab-${active}`)?.focus();
    });
  };

  const handleKeyDown = (event, index) => {
    let nextIndex;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % requestTabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + requestTabs.length) % requestTabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = requestTabs.length - 1;
    else if (event.key === "Delete") {
      event.preventDefault();
      handleClose(requestTabs[index].id);
      return;
    } else return;

    event.preventDefault();
    const nextId = requestTabs[nextIndex].id;
    selectRequest(nextId);
    document.getElementById(`request-tab-${nextId}`)?.focus();
  };

  return (
    <div className="request-document-tabs">
      <div className="request-document-tab-list" role="tablist" aria-label="Open API requests">
        {requestTabs.map((request, index) => {
          const title = requestTitle(request);
          const selected = request.id === activeRequestId;
          return (
            <div
              key={request.id}
              className={`request-document-tab ${selected ? "active" : ""}`}
              onAuxClick={(event) => {
                if (event.button === 1) {
                  event.preventDefault();
                  handleClose(request.id);
                }
              }}
            >
              <button
                type="button"
                id={`request-tab-${request.id}`}
                className="request-document-tab-select"
                role="tab"
                aria-selected={selected}
                aria-controls="request-workspace"
                aria-label={`${request.method} ${title}${request.loading ? ", sending" : ""}`}
                tabIndex={selected ? 0 : -1}
                title={request.url || title}
                onClick={() => selectRequest(request.id)}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                <span className={`request-tab-method method-${request.method.toLowerCase()}`}>{request.method}</span>
                <span className="request-tab-title">{title}</span>
                {request.loading && <LoaderCircle size={14} className="request-tab-loading" aria-hidden="true" />}
              </button>
              <button
                type="button"
                className="request-document-tab-close"
                aria-label={`Close ${request.method} ${title}`}
                title="Close request"
                onClick={() => handleClose(request.id)}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        className="request-document-tab-add"
        aria-label="New request tab"
        title="New request tab"
        onClick={() => {
          newRequest();
          requestAnimationFrame(() => document.getElementById("request-url")?.focus());
        }}
      >
        <Plus size={18} />
      </button>
    </div>
  );
}

export default RequestWorkspaceTabs;
