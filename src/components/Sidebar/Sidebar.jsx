import useRequestStore from "../../store/requestStore";

function Sidebar() {
  const { history } = useRequestStore();

  return (
    <aside className="sidebar">
      <h3>History</h3>

      {history.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        <ul>
          {history.map((item) => (
            <li
              key={item.id}
              style={{
                marginBottom: "10px",
                padding: "8px",
                border: "1px solid #374151",
                borderRadius: "6px",
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