import { useState } from "react";
import useRequestStore from "../../store/requestStore";

import Button from "../ui/Button/Button";
import Input from "../ui/Input/Input";

function ParamsEditor() {
  const { params, setParams } = useRequestStore();

  const [paramKey, setParamKey] = useState("");
  const [paramValue, setParamValue] = useState("");

  const addParam = () => {
    if (!paramKey.trim()) return;

    setParams([
      ...params,
      {
        key: paramKey,
        value: paramValue,
      },
    ]);

    setParamKey("");
    setParamValue("");
  };

  const removeParam = (index) => {
    setParams(params.filter((_, i) => i !== index));
  };

  return (
    <div className="request-editor">

      <div className="editor-table">

        <div className="table-header">
          <span>Key</span>
          <span>Value</span>
        </div>

        <div className="table-row">
          <Input
            placeholder="Key"
            value={paramKey}
            onChange={(e) => setParamKey(e.target.value)}
          />

          <Input
            placeholder="Value"
            value={paramValue}
            onChange={(e) => setParamValue(e.target.value)}
          />
        </div>

        <div className="table-footer">
          <Button
            variant="secondary"
            onClick={addParam}
          >
            + Add Parameter
          </Button>
        </div>

      </div>

      <ul className="editor-list">
        {params.map((param, index) => (
          <li key={index}>
            <span>
              {param.key}
            </span>

            <span>
              {param.value}
            </span>

            <Button
              variant="danger"
              onClick={() => removeParam(index)}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>

    </div>
  );
}

export default ParamsEditor;