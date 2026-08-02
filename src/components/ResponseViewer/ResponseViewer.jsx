import useRequestStore from "../../store/requestStore";

function ResponseViewer() {
  const { response } = useRequestStore();

  if (!response) {
    return (
      <div className="response-viewer">
        <p>No response yet.</p>
      </div>
    );
  }

  return (
    <div className="response-viewer">
      <p>
        <strong>Status:</strong> {response.status} {response.statusText}
      </p>

      <p>
        <strong>Time:</strong> {response.time} ms
      </p>

      <pre
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflowX: "auto",
        }}
      >
        {JSON.stringify(response.data, null, 2)}
      </pre>
    </div>
  );
}

export default ResponseViewer;
