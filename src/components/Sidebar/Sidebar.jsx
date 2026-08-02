import useRequestStore from "../../store/requestStore";

function Sidebar() {
  const {
    history,
    collections,
    loadRequest,
    loadCollection,
    deleteCollection,
  } = useRequestStore();

  return (
    <aside className="sidebar">
      <h3>Collections</h3>

      <h3 className="sidebar-title">Collections</h3>

      {collections.length === 0 ? (
        <p className="empty-text">No saved requests.</p>
      ) : (
        <ul className="sidebar-list">
          {collections.map((item) => (
            <li key={item.id} className="sidebar-card">
              <div
                className="sidebar-card-content"
                onClick={() => loadCollection(item)}
              >
                <div className={`method-badge ${item.method.toLowerCase()}`}>
                  {item.method}
                </div>

                <h4>{item.name}</h4>

                <p>{item.url}</p>
              </div>

              <button
                className="delete-btn"
                onClick={() => deleteCollection(item.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <hr style={{ margin: "20px 0" }} />

      <h3 className="sidebar-title">History</h3>

      {history.length === 0 ? (
        <p className="empty-text">No requests yet.</p>
      ) : (
        <ul className="sidebar-list">
          {history.map((item) => (
            <li
              key={item.id}
              className="sidebar-card"
              onClick={() => loadRequest(item)}
            >
              <div className={`method-badge ${item.method.toLowerCase()}`}>
                {item.method}
              </div>

              <p>{item.url}</p>

              <span className="status-text">Status {item.status}</span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

export default Sidebar;
