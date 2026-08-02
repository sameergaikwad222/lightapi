import { useState } from "react";
import useRequestStore from "../../store/requestStore";

function RequestEditor() {
  const {
    params,
    headers,
    setParams,
    setHeaders,
  } = useRequestStore();

  const [paramKey, setParamKey] = useState("");
  const [paramValue, setParamValue] = useState("");

  const [headerKey, setHeaderKey] = useState("");
  const [headerValue, setHeaderValue] = useState("");

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
      <h3>Query Params</h3>

      <div>
        <input
          type="text"
          placeholder="Key"
          value={paramKey}
          onChange={(e) => setParamKey(e.target.value)}
        />

        <input
          type="text"
          placeholder="Value"
          value={paramValue}
          onChange={(e) => setParamValue(e.target.value)}
        />

        <button onClick={addParam}>Add</button>
      </div>

      <ul>
        {params.map((param, index) => (
          <li key={index}>
            {param.key} = {param.value}
            <button onClick={() => removeParam(index)}>Delete</button>
          </li>
        ))}
      </ul>

      <hr />

      <h3>Headers</h3>

      <div>
        <input
          type="text"
          placeholder="Header"
          value={headerKey}
          onChange={(e) => setHeaderKey(e.target.value)}
        />

        <input
          type="text"
          placeholder="Value"
          value={headerValue}
          onChange={(e) => setHeaderValue(e.target.value)}
        />

        <button onClick={addHeader}>Add</button>
      </div>

      <ul>
        {headers.map((header, index) => (
          <li key={index}>
            {header.key} = {header.value}
            <button onClick={() => removeHeader(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RequestEditor;