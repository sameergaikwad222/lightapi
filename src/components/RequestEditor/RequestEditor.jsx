import useRequestStore from "../../store/requestStore";

import ParamsEditor from "./ParamsEditor";
import HeadersEditor from "./HeadersEditor";
import BodyEditor from "./BodyEditor";
import AuthEditor from "./AuthEditor";

function RequestEditor() {
  const { activeTab, activeRequestId } = useRequestStore();

  switch (activeTab) {
    case "params":
      return <ParamsEditor key={activeRequestId} />;

    case "headers":
      return <HeadersEditor key={activeRequestId} />;

    case "body":
      return <BodyEditor key={activeRequestId} />;

    case "auth":
      return <AuthEditor key={activeRequestId} />;

    default:
      return <div>Other Tabs</div>;
  }
}

export default RequestEditor;
