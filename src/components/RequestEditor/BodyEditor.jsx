import useRequestStore from "../../store/requestStore";

function BodyEditor() {
  const { body, setBody } = useRequestStore();

  return (
    <div className="request-editor">
      <textarea
        className="body-editor"
        placeholder={`{
  "name": "John"
}`}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
    </div>
  );
}

export default BodyEditor;