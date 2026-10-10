import { useEffect, useRef, useState } from "react";
import Button from "../ui/Button/Button";
import { parseCurl } from "../../utils/curl";

function CurlImportModal({ onClose, onImport }) {
  const dialogRef = useRef(null);
  const [command, setCommand] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  const handleImport = (event) => {
    event.preventDefault();
    try {
      onImport(parseCurl(command));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="modal curl-import-modal"
      aria-labelledby="curl-import-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <form onSubmit={handleImport}>
        <h2 id="curl-import-title">Import cURL</h2>
        <p className="curl-import-description" id="curl-import-help">
          Paste a cURL command to create a request. Review it, then click Send when you’re ready.
        </p>
        <label className="modal-label" htmlFor="curl-command">cURL command</label>
        <textarea
          id="curl-command"
          className="curl-command"
          rows={9}
          autoFocus
          spellCheck={false}
          value={command}
          placeholder={'curl "https://api.example.com/users" \\\n  -H "Accept: application/json"'}
          aria-describedby={error ? "curl-import-help curl-import-error" : "curl-import-help"}
          aria-invalid={!!error}
          onChange={(event) => {
            setCommand(event.target.value);
            setError("");
          }}
        />
        {error && <p className="curl-import-error" id="curl-import-error" role="alert">{error}</p>}
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!command.trim()}>Import Request</Button>
        </div>
      </form>
    </dialog>
  );
}

export default CurlImportModal;
