import Input from "../ui/Input/Input";
function TableRow({
  checked = true,
  keyName,
  value,
  onKeyChange,
  onValueChange,
  onDelete,
}) {
  return (
    <div className="table-row">

      <Input
        type="checkbox"
        checked={checked}
        readOnly
      />

      <Input
        value={keyName}
        placeholder="Key"
        onChange={(e) => onKeyChange(e.target.value)}
      />

      <Input
        value={value}
        placeholder="Value"
        onChange={(e) => onValueChange(e.target.value)}
      />

      <button
        className="icon-btn"
        onClick={onDelete}
      >
        🗑
      </button>

    </div>
  );
}

export default TableRow;