import { useState } from "react";
import { Globe, PanelLeftClose, PanelLeftOpen, Plus, Terminal } from "lucide-react";

import EnvironmentModal from "../Environment/EnvironmentModal";
import CurlImportModal from "../CurlImportModal/CurlImportModal";
import useRequestStore from "../../store/requestStore";

function Header({ sidebarCollapsed, onToggleSidebar }) {
  const [showEnvironment, setShowEnvironment] = useState(false);
  const [showCurlImport, setShowCurlImport] = useState(false);
  const { newRequest } = useRequestStore();

  const handleNewRequest = () => {
    newRequest();
    requestAnimationFrame(() => document.getElementById("request-url")?.focus());
  };

  return (
    <>
      <header className="header">
        <div className="header-left">
          <button
            type="button"
            className="sidebar-toggle"
            onClick={onToggleSidebar}
            aria-label={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
            title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
            aria-expanded={!sidebarCollapsed}
            aria-controls="sidebar-panel"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
          <h2 className="logo">🚀 LightAPI</h2>
        </div>

        <div className="header-right">
          <button type="button" className="header-btn" onClick={handleNewRequest}>
            <Plus size={18} />
            New Request
          </button>
          <button type="button" className="header-btn" onClick={() => setShowCurlImport(true)}>
            <Terminal size={18} />
            Import cURL
          </button>
          <button
            className="header-btn"
            onClick={() => setShowEnvironment(true)}
          >
            <Globe size={18} />
            Environments
          </button>
        </div>
      </header>

      {showCurlImport && (
        <CurlImportModal
          onClose={() => setShowCurlImport(false)}
          onImport={(request) => {
            newRequest(request);
            setShowCurlImport(false);
          }}
        />
      )}

      <EnvironmentModal
        open={showEnvironment}
        onClose={() => setShowEnvironment(false)}
      />
    </>
  );
}

export default Header;
