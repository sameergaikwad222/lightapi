import { useState } from "react";
import useRequestStore from "../../store/requestStore";

function RequestEditor() {
  const { params, setParams } = useRequestStore();

  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  const addParam = () => {
    if (!key.trim()) return;

    setParams([
      ...params,
      {
        key,
        value,
      },
    ]);

    setKey("");
    setValue("");
  };

  const removeParam = (index) => {
    setParams(params.filter((_, i) => i !== index));
  };

  return (
    <div className="request-editor">
      <h3>Query Params</h3>

      <div>
        <input
          type="text"
          placeholder="Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />

        <input
          type="text"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <button onClick={addParam}>Add</button>
      </div>

      <ul>
        {params.map((param, index) => (
          <li key={index}>
            {param.key} = {param.value}
            <button onClick={() => removeParam(index)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RequestEditor;