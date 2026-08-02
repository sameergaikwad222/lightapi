import { useState } from "react";
import useRequestStore from "../../store/requestStore";

function RequestEditor() {
  const {
    activeTab,
    params,
    headers,
    body,
    auth,
    setParams,
    setHeaders,
    setBody,
    setAuth,
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
      {activeTab === "params" && (
        <>
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
        </>
      )}

      {activeTab === "headers" && (
        <>
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
        </>
      )}

      {activeTab === "body" && (
        <>
          <h3>Request Body (JSON)</h3>

          <textarea
            rows={12}
            placeholder='{"name":"John"}'
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </>
      )}

      {activeTab === "auth" && (
        <>
          <h3>Authentication</h3>

          <div>
            <label>Type</label>

            <select
              value={auth.type}
              onChange={(e) =>
                setAuth({
                  ...auth,
                  type: e.target.value,
                })
              }
            >
              <option value="none">None</option>
              <option value="bearer">Bearer Token</option>
            </select>
          </div>

          {auth.type === "bearer" && (
            <div>
              <label>Token</label>

              <input
                type="text"
                placeholder="Enter Bearer Token"
                value={auth.token}
                onChange={(e) =>
                  setAuth({
                    ...auth,
                    token: e.target.value,
                  })
                }
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RequestEditor;
