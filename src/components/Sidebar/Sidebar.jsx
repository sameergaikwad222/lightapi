import useRequestStore from "../../store/requestStore";

function Sidebar() {
  const {
    history,
    collections,
    loadRequest,
    loadCollection,
  } = useRequestStore();

  return (
    <aside className="sidebar">
      <h3>Collections</h3>

      {collections.length === 0 ? (
        <p>No saved requests.</p>
      ) : (
        <ul>
          {collections.map((item) => (
            <li
              key={item.id}
              onClick={() => loadCollection(item)}
              style={{
                marginBottom: "10px",
                padding: "8px",
                border: "1px solid #374151",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              <div>
                <strong>{item.name}</strong>
              </div>

              <div
                style={{
                  fontSize: "12px",
                  marginTop: "4px",
                }}
              >
                {item.method}
              </div>

              <div
                style={{
                  fontSize: "12px",
                  wordBreak: "break-all",
                }}
              >
                {item.url}
              </div>
            </li>
          ))}
        </ul>
      )}

      <hr style={{ margin: "20px 0" }} />

      <h3>History</h3>

      {history.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        <ul>
          {history.map((item) => (
            <li
              key={item.id}
              onClick={() => loadRequest(item)}
              style={{
                marginBottom: "10px",
                padding: "8px",
                border: "1px solid #374151",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              <div>
                <strong>{item.method}</strong>
              </div>

              <div
                style={{
                  fontSize: "12px",
                  wordBreak: "break-all",
                }}
              >
                {item.url}
              </div>

              <div
                style={{
                  fontSize: "12px",
                  marginTop: "4px",
                }}
              >
                Status: {item.status}
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

export default Sidebar;