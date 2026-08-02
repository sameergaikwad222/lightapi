import { useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import useRequestStore from "../../store/requestStore";

function Sidebar() {
  const {
    history,
    collections,
    loadRequest,
    loadCollection,
    deleteCollection,
    clearHistory,
    selectedHistoryId,
    selectedCollectionId,
  } = useRequestStore();

  const [search, setSearch] = useState("");

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
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q) ||
        item.method.toLowerCase().includes(q)
    );
  }, [collections, search]);

  return (
    <aside className="sidebar">

      <div className="sidebar-search">

        <Search size={16} />

        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      {/* HISTORY */}

      <div className="sidebar-section">

        <div className="sidebar-section-header">

          <h3>History</h3>

          <button
            className="icon-btn"
            onClick={clearHistory}
            title="Clear History"
          >
            <Trash2 size={16} />
          </button>

        </div>

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
                onClick={() => loadRequest(item)}
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

      </div>

      <div className="sidebar-divider" />

      {/* COLLECTIONS */}

      <div className="sidebar-section">

        <div className="sidebar-section-header">

          <h3>Collections</h3>

        </div>

        {filteredCollections.length === 0 ? (
          <div className="empty-text">
            No collections found
          </div>
        ) : (
          <ul className="sidebar-list">

            {filteredCollections.map((item) => (
              <li
                key={item.id}
                className={`sidebar-item ${
                  selectedCollectionId === item.id
                    ? "active"
                    : ""
                }`}
              >

                <div
                  className="sidebar-item-content"
                  onClick={() =>
                    loadCollection(item)
                  }
                >
                  <span
                    className={`method method-${item.method.toLowerCase()}`}
                  >
                    {item.method}
                  </span>

                  <span className="request-name">
                    {item.name}
                  </span>

                </div>

                <button
                  className="sidebar-delete"
                  onClick={() =>
                    deleteCollection(item.id)
                  }
                >
                  <Trash2 size={14} />
                </button>

              </li>
            ))}

          </ul>
        )}

      </div>

    </aside>
  );
}

export default Sidebar;