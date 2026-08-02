import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import RequestBar from "../components/RequestBar/RequestBar";
import RequestTabs from "../components/RequestTabs/RequestTabs";
import RequestEditor from "../components/RequestEditor/RequestEditor";
import ResponseViewer from "../components/ResponseViewer/ResponseViewer";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import "../styles/layout.css";

function Home() {
  return (
    <div className="app">
      <Header />

      <div className="main-content">
        <Sidebar />

        <div className="workspace">
          <RequestBar />

          <RequestTabs />

          <PanelGroup
            direction="vertical"
            autoSaveId="lightapi-editor-response"
          >
            <Panel defaultSize={60} minSize={20}>
              <RequestEditor />
            </Panel>

            <PanelResizeHandle className="resize-handle" />

            <Panel defaultSize={40} minSize={20}>
              <ResponseViewer />
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </div>
  );
}

export default Home;
