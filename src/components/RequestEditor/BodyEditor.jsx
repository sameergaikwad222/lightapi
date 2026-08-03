import Editor from "@monaco-editor/react";
import useRequestStore from "../../store/requestStore";

function BodyEditor() {
  const { body, setBody } = useRequestStore();

  return (
    <div className="body-editor-container">
      <Editor
        height="450px"
        defaultLanguage="json"
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