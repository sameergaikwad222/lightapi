import { useEffect, useState } from "react";
import Button from "../ui/Button/Button";
import Input from "../ui/Input/Input";
import useRequestStore from "../../store/requestStore";
import "./Environment.css";

function EnvironmentModal({ open, onClose }) {
  const { environment, setEnvironment } = useRequestStore();

  const [variables, setVariables] = useState([]);

  useEffect(() => {
    if (open) {
      if (environment.length === 0) {
        setVariables([
          {
            id: crypto.randomUUID(),
            key: "baseUrl",
            value: "https://jsonplaceholder.typicode.com",
          },
        ]);
      } else {
        setVariables(environment);
      }
    }
  }, [open, environment]);

  if (!open) return null;

  const updateVariable = (id, field, value) => {
    setVariables((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addVariable = () => {
    setVariables((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        key: "",
        value: "",
      },
    ]);
  };

  const deleteVariable = (id) => {
    setVariables((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const handleSave = () => {
    const cleaned = variables.filter(
      (item) =>
        item.key.trim() !== "" &&
        item.value.trim() !== ""
    );

    setEnvironment(cleaned);

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="environment-modal">
        <div className="modal-header">
          <h2>Environment Variables</h2>

          <Button
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>
        </div>

        <div className="environment-table">
          <div className="environment-header">
            <span>Name</span>

            <span>Value</span>

            <span></span>
          </div>

          {variables.map((item) => (
            <div
              key={item.id}
              className="environment-row"
            >
              <Input
                value={item.key}
                placeholder="Variable Name"
                onChange={(e) =>
                  updateVariable(
                    item.id,
                    "key",
                    e.target.value
                  )
                }
              />

              <Input
                value={item.value}
                placeholder="Variable Value"
                onChange={(e) =>
                  updateVariable(
                    item.id,
                    "value",
                    e.target.value
                  )
                }
              />

              <Button
                variant="danger"
                onClick={() =>
                  deleteVariable(item.id)
                }
              >
                Delete
              </Button>
            </div>
          ))}

        </div>

        <div className="modal-footer">
          <Button
            variant="secondary"
            onClick={addVariable}
          >
            + Add Variable
          </Button>

          <Button onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EnvironmentModal;