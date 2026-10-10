import Editor from "@monaco-editor/react";
import { Plus, Trash2 } from "lucide-react";
import useRequestStore from "../../store/requestStore";
import Button from "../ui/Button/Button";
import { BODY_TYPES, createBodyField, fileMetadata } from "../../utils/requestBody";

function BodyEditor() {
  const {
    body, bodyType, bodyFields, bodyFile, bodyFileMeta, bodyError,
    setBody, setBodyType, setBodyFields, setBodyFile,
  } = useRequestStore();
  const format = BODY_TYPES.find(type => type.value === bodyType);
  const isForm = bodyType === "form-data" || bodyType === "urlencoded";
  const updateField = (id, changes) => setBodyFields(bodyFields.map(field =>
    field.id === id ? { ...field, ...changes } : field,
  ));

  return (
    <div className="body-editor">
      <div className="body-toolbar">
        <label htmlFor="request-body-type">Body type</label>
        <select id="request-body-type" value={bodyType} onChange={event => setBodyType(event.target.value)}>
          {BODY_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
        </select>
        <span className="body-format-hint">
          {bodyType === "form-data" ? "Text fields and file uploads" : format?.contentType ?? "No request body"}
        </span>
      </div>

      {bodyError && <p className="body-error" role="alert">{bodyError}</p>}

      {bodyType === "none" ? (
        <p className="body-empty">This request will be sent without a body.</p>
      ) : isForm ? (
        <div className="body-form-editor">
          <div className="body-form-actions">
            <Button variant="secondary" onClick={() => setBodyFields([...bodyFields, createBodyField()])}>
              <Plus size={16} /> Add field
            </Button>
            <span>Use repeated keys to send multiple values.</span>
          </div>
          <div className="body-fields-scroll">
            {bodyFields.length === 0 && <p className="body-empty">Add fields to build your request body.</p>}
            {bodyFields.map((field, index) => (
              <div className="body-field-row" key={field.id}>
                <input type="checkbox" checked={field.enabled !== false}
                  aria-label={`Include body field ${index + 1}`}
                  onChange={event => updateField(field.id, { enabled: event.target.checked })} />
                <input className="body-field-input" placeholder="Key" value={field.key}
                  aria-label={`Body field ${index + 1} key`}
                  onChange={event => updateField(field.id, { key: event.target.value })} />
                <select value={field.type ?? "text"} aria-label={`Body field ${index + 1} type`}
                  onChange={event => updateField(field.id, { type: event.target.value })}>
                  <option value="text">Text</option>
                  <option value="file" disabled={bodyType === "urlencoded"}>File</option>
                </select>
                {field.type === "file" ? (
                  <div className="body-file-value">
                    {bodyType === "form-data" ? (
                      <>
                        <input type="file" aria-label={`Body field ${index + 1} file`}
                          onChange={event => {
                            const file = event.target.files[0] ?? null;
                            updateField(field.id, { file, fileMeta: fileMetadata(file) });
                          }} />
                        {field.fileMeta && <span className="body-file-name">
                          {field.file ? field.fileMeta.name : `Select ${field.fileMeta.name} again to send.`}
                        </span>}
                      </>
                    ) : <span className="body-file-name">Switch to Text, or use form-data to upload a file.</span>}
                  </div>
                ) : (
                  <input className="body-field-input" placeholder="Value" value={field.value ?? ""}
                    aria-label={`Body field ${index + 1} value`}
                    onChange={event => updateField(field.id, { value: event.target.value })} />
                )}
                <button type="button" className="body-remove-field" aria-label={`Remove body field ${index + 1}`}
                  title="Remove field" onClick={() => setBodyFields(bodyFields.filter(item => item.id !== field.id))}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : bodyType === "binary" ? (
        <div className="body-binary-editor">
          <label htmlFor="request-body-file">Choose a file to send as the request body</label>
          <input id="request-body-file" type="file"
            onChange={event => setBodyFile(event.target.files[0] ?? null)} />
          {bodyFileMeta && <p className="body-file-name">
            {bodyFile ? `${bodyFileMeta.name} (${bodyFileMeta.size.toLocaleString()} bytes)` : `Select ${bodyFileMeta.name} again to send.`}
          </p>}
          <p className="body-format-hint">Saved requests keep the file name. Select the file again after reopening the app.</p>
        </div>
      ) : null}
      {/* Keep the raw editor mounted to preserve undo history when switching formats. */}
      <div className="body-editor-container" hidden={!format?.language}>
        <Editor height="100%" language={format?.language ?? "plaintext"}
          value={body} onChange={value => setBody(value || "")} theme="vs-dark"
          options={{
            minimap: { enabled: false }, fontSize: 14, wordWrap: "on",
            automaticLayout: true, scrollBeyondLastLine: false,
            formatOnPaste: true, formatOnType: true, tabSize: 2,
            roundedSelection: false, padding: { top: 16 },
          }} />
      </div>
    </div>
  );
}

export default BodyEditor;
