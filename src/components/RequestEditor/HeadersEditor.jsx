import { useState } from "react";
import useRequestStore from "../../store/requestStore";

import Button from "../ui/Button/Button";
import Input from "../ui/Input/Input";

function HeadersEditor() {
  const { headers, setHeaders } = useRequestStore();

  const [headerKey, setHeaderKey] = useState("");
  const [headerValue, setHeaderValue] = useState("");

  const addHeader = () => {
    if (!headerKey.trim()) return;

    setHeaders([
      ...headers,
      {
        key: headerKey,
        value: headerValue,
      },
    ]);

    setHeaderKey("");
    setHeaderValue("");
  };

  const removeHeader = (index) => {
    setHeaders(headers.filter((_, i) => i !== index));
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
            placeholder="Header"
            value={headerKey}
            onChange={(e) => setHeaderKey(e.target.value)}
          />

          <Input
            placeholder="Value"
            value={headerValue}
            onChange={(e) => setHeaderValue(e.target.value)}
          />
        </div>

        <div className="table-footer">
          <Button
            variant="secondary"
            onClick={addHeader}
          >
            + Add Header
          </Button>
        </div>

      </div>

      <ul className="editor-list">
        {headers.map((header, index) => (
          <li key={index}>
            <span>{header.key}</span>

            <span>{header.value}</span>

            <Button
              variant="danger"
              onClick={() => removeHeader(index)}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>

    </div>
  );
}

export default HeadersEditor;