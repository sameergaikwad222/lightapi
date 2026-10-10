import useRequestStore from "../../store/requestStore";

import Button from "../ui/Button/Button";
import Input from "../ui/Input/Input";

function ParamsEditor() {
  const { params, setParams, paramDraft, setParamDraft } = useRequestStore();
  const { key: paramKey, value: paramValue } = paramDraft;

  const addParam = () => {
    if (!paramKey.trim()) return;

    setParams([
      ...params,
      {
        key: paramKey,
        value: paramValue,
      },
    ]);

    setParamDraft({ key: "", value: "" });
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
            onChange={(e) => setParamDraft({ ...paramDraft, key: e.target.value })}
          />

          <Input
            placeholder="Value"
            value={paramValue}
            onChange={(e) => setParamDraft({ ...paramDraft, value: e.target.value })}
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
