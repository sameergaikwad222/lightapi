import { useRef, useState } from "react";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import RequestBar from "../components/RequestBar/RequestBar";
import RequestTabs from "../components/RequestTabs/RequestTabs";
import RequestWorkspaceTabs from "../components/RequestWorkspaceTabs/RequestWorkspaceTabs";
import RequestEditor from "../components/RequestEditor/RequestEditor";
import ResponseViewer from "../components/ResponseViewer/ResponseViewer";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import "../styles/layout.css";
import useRequestStore from "../store/requestStore";

function Home() {
  const sidebarPanelRef = useRef(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const activeRequestId = useRequestStore(state => state.activeRequestId);

  const toggleSidebar = () => {
    const panel = sidebarPanelRef.current;
    if (!panel) return;

    if (panel.isCollapsed()) {
      panel.expand();
    } else {
      panel.collapse();
    }
  };

  return (
    <div className="app">
      <Header
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={toggleSidebar}
      />

      <div className="main-content">
        <PanelGroup
          direction="horizontal"
          autoSaveId="lightapi-sidebar-workspace"
        >
          <Panel
            id="sidebar-panel"
            order={1}
            ref={sidebarPanelRef}
            defaultSize={20}
            minSize={15}
            maxSize={40}
            collapsible
            collapsedSize={0}
            onCollapse={() => setSidebarCollapsed(true)}
            onExpand={() => setSidebarCollapsed(false)}
          >
            <div className="sidebar-panel-content" hidden={sidebarCollapsed}>
              <Sidebar />
            </div>
          </Panel>

          <PanelResizeHandle
            className="sidebar-resize-handle"
            aria-label="Resize sidebar"
            title="Drag to resize sidebar"
          />

          <Panel id="workspace-panel" order={2} defaultSize={80} minSize={50}>
            <div className="workspace">
              <RequestWorkspaceTabs />
              <div
                id="request-workspace"
                className="request-workspace"
                role="tabpanel"
                aria-labelledby={`request-tab-${activeRequestId}`}
              >
                <RequestBar key={activeRequestId} />

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
                    <ResponseViewer key={activeRequestId} />
                  </Panel>
                </PanelGroup>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default Home;
