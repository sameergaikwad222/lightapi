import { useEffect, useState } from "react";
import Input from "../ui/Input/Input";
import Button from "../ui/Button/Button";

function SaveRequestModal({
  isOpen,
  collections = [],
  onClose,
  onSave,
}) {
  const [collectionId, setCollectionId] = useState(
    collections[0]?.id || "new",
  );
  const [collectionName, setCollectionName] = useState("");
  const [requestName, setRequestName] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setCollectionId(collections[0]?.id || "new");
      setCollectionName("");
      setRequestName("");
    }
  }, [isOpen, collections]);

  if (!isOpen) return null;

  const handleSave = (event) => {
    event.preventDefault();

    const trimmedRequestName = requestName.trim();
    const trimmedCollectionName = collectionName.trim();

    if (!trimmedRequestName) return;
    if (collectionId === "new" && !trimmedCollectionName) return;

    onSave({
      collectionId: collectionId === "new" ? null : collectionId,
      collectionName: trimmedCollectionName,
      requestName: trimmedRequestName,
    });
    setRequestName("");
  };

  const handleClose = () => {
    setCollectionName("");
    setRequestName("");
    onClose();
  };

  return (
    <div className="modal-overlay" onMouseDown={handleClose}>
      <form
        className="modal"
        onSubmit={handleSave}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2>Save API Request</h2>

        <label className="modal-label" htmlFor="collection-select">
          Collection folder
        </label>
        <select
          id="collection-select"
          className="modal-select"
          value={collectionId}
          onChange={(event) => setCollectionId(event.target.value)}
        >
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
          <option value="new">+ New collection folder</option>
        </select>

        {collectionId === "new" && (
          <Input
            autoFocus
            placeholder="Collection folder name"
            value={collectionName}
            onChange={(event) => setCollectionName(event.target.value)}
          />
        )}

        <label className="modal-label" htmlFor="request-name">
          API name
        </label>
        <Input
          id="request-name"
          autoFocus={collectionId !== "new"}
          placeholder="Request name"
          value={requestName}
          onChange={(event) => setRequestName(event.target.value)}
        />

        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              !requestName.trim() ||
              (collectionId === "new" && !collectionName.trim())
            }
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}

export default SaveRequestModal;
