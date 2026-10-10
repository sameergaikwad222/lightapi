import Editor from "@monaco-editor/react";
import useRequestStore from "../../store/requestStore";
import { isJsonContentType } from "../../utils/request";

function BodyEditor() {
  const { body, headers, setBody } = useRequestStore();
  const contentType = headers.find(header => header.key.toLowerCase() === "content-type")?.value;

  return (
    <div className="body-editor-container">
      <Editor
        height="450px"
        language={isJsonContentType(contentType) ? "json" : "plaintext"}
        value={body}
        onChange={(value) => setBody(value || "")}
        theme="vs-dark"
        options={{
          minimap: {
            enabled: false,
          },

          fontSize: 14,

          wordWrap: "on",

          automaticLayout: true,

          scrollBeyondLastLine: false,

          formatOnPaste: true,

          formatOnType: true,

          tabSize: 2,

          roundedSelection: false,

          padding: {
            top: 16,
          },
        }}
      />
    </div>
  );
}

export default BodyEditor;
