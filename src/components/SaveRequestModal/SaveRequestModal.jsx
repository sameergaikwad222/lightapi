import { useState } from "react";

function SaveRequestModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) return;

    onSave(name);
    setName("");
  };

  const handleClose = () => {
    setName("");
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 100,
        left: 100,
        width: 400,
        background: "red",
        color: "white",
        padding: 20,
        zIndex: 99999,
      }}
    >
      <h2>Modal Works!</h2>

      <input value={name} onChange={(e) => setName(e.target.value)} />

      <button onClick={handleSave}>Save</button>
      <button onClick={handleClose}>Cancel</button>
    </div>
  );
}

export default SaveRequestModal;
