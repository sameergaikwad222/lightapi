import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Search,
  Trash2,
} from "lucide-react";

import useRequestStore from "../../store/requestStore";

function Sidebar() {
  const {
    history,
    collections,
    loadRequest,
    loadCollection,
    deleteCollection,
    deleteCollectionRequest,
    clearHistory,
    selectedHistoryId,
    selectedCollectionId,
    selectedCollectionRequestId,
  } = useRequestStore();

  const [search, setSearch] = useState("");

  const [historyOpen, setHistoryOpen] = useState(true);

  const [collectionsOpen, setCollectionsOpen] =
    useState(true);

  const getRequestName = (url = "") => {
    try {
      const u = new URL(url);

      return u.pathname === "/" ? u.hostname : u.pathname;
    } catch {
      return url;
    }
  };

  const filteredHistory = useMemo(() => {
    const q = search.toLowerCase();

    return history.filter(
      (item) =>
        item.url.toLowerCase().includes(q) ||
        item.method.toLowerCase().includes(q)
    );
  }, [history, search]);

  const filteredCollections = useMemo(() => {
    const q = search.toLowerCase();

    return collections.filter(
      (collection) =>
        collection.name.toLowerCase().includes(q) ||
        collection.requests.some(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.url.toLowerCase().includes(q) ||
            item.method.toLowerCase().includes(q),
        ),
    );
  }, [collections, search]);

  return (
    <aside className="sidebar">

      <div className="sidebar-search">
        <Search size={16} />

        <input
          placeholder="Search..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </div>

      {/* HISTORY */}

      <div className="sidebar-section">

        <div className="sidebar-section-header">

          <button
            className="section-toggle"
            onClick={() =>
              setHistoryOpen(!historyOpen)
            }
          >
            {historyOpen ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}

            History
          </button>

          <button
            className="icon-btn"
            onClick={clearHistory}
          >
            <Trash2 size={16} />
          </button>

        </div>

        {historyOpen && (
          <>
            {filteredHistory.length === 0 ? (
              <div className="empty-text">
                No requests found
              </div>
            ) : (
              <ul className="sidebar-list">
                {filteredHistory.map((item) => (
                  <li
                    key={item.id}
                    className={`sidebar-item ${
                      selectedHistoryId === item.id
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      loadRequest(item)
                    }
                  >
                    <span
                      className={`method method-${item.method.toLowerCase()}`}
                    >
                      {item.method}
                    </span>

                    <span className="request-name">
                      {getRequestName(item.url)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

      </div>

      <div className="sidebar-divider" />

      {/* COLLECTIONS */}

      <div className="sidebar-section">

        <div className="sidebar-section-header">

          <button
            className="section-toggle"
            onClick={() =>
              setCollectionsOpen(
                !collectionsOpen
              )
            }
          >
            {collectionsOpen ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}

            <span className="section-title">
              <FolderOpen size={15} />
              API Collection
              <span className="section-count">
                {collections.length}
              </span>
            </span>
          </button>

        </div>

        {collectionsOpen && (
          <>
            {filteredCollections.length === 0 ? (
              <div className="empty-text">
                No saved APIs found
              </div>
            ) : (
              <ul className="sidebar-list">
                {filteredCollections.map((collection) => {
                  const requests = collection.requests.filter((item) => {
                    const q = search.toLowerCase();

                    return (
                      !q ||
                      collection.name.toLowerCase().includes(q) ||
                      item.name.toLowerCase().includes(q) ||
                      item.url.toLowerCase().includes(q) ||
                      item.method.toLowerCase().includes(q)
                    );
                  });

                  return (
                    <li key={collection.id} className="collection-folder">
                      <div className="collection-folder-header">
                        <span className="collection-folder-name">
                          <FolderOpen size={14} />
                          {collection.name}
                          <span className="folder-count">
                            {collection.requests.length}
                          </span>
                        </span>

                        <button
                          className="sidebar-delete"
                          onClick={() => deleteCollection(collection.id)}
                          title="Delete collection folder"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <ul className="collection-request-list">
                        {requests.map((item) => (
                          <li
                            key={item.id}
                            className={`sidebar-item ${
                              selectedCollectionRequestId === item.id
                                ? "active"
                                : ""
                            }`}
                          >
                            <div
                              className="sidebar-item-content"
                              onClick={() => loadCollection(item, collection.id)}
                            >
                              <span
                                className={`method method-${item.method.toLowerCase()}`}
                              >
                                {item.method}
                              </span>

                              <span className="request-details">
                                <span className="request-name">{item.name}</span>
                                <span className="request-url">
                                  {getRequestName(item.url)}
                                </span>
                              </span>
                            </div>

                            <button
                              className="sidebar-delete"
                              onClick={() =>
                                deleteCollectionRequest(collection.id, item.id)
                              }
                              title="Delete saved API"
                            >
                              <Trash2 size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

      </div>

    </aside>
  );
}

export default Sidebar;