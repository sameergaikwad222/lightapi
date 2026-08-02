import useRequestStore from "../../store/requestStore";

import ParamsEditor from "./ParamsEditor";
import HeadersEditor from "./HeadersEditor";
import BodyEditor from "./BodyEditor";
import AuthEditor from "./AuthEditor";

function RequestEditor() {
  const { activeTab } = useRequestStore();

  switch (activeTab) {
    case "params":
      return <ParamsEditor />;

    case "headers":
      return <HeadersEditor />;

    case "body":
      return <BodyEditor />;

    case "auth":
      return <AuthEditor />;

    default:
      return <div>Other Tabs</div>;
  }
}

export default RequestEditor;