import { useState } from "react";
import { Globe } from "lucide-react";

import EnvironmentModal from "../Environment/EnvironmentModal";

function Header() {
  const [showEnvironment, setShowEnvironment] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header-left">
          <h2 className="logo">LightAPI</h2>
        </div>

        <div className="header-right">
          <button
            className="header-btn"
            onClick={() => setShowEnvironment(true)}
          >
            <Globe size={18} />
            Environments
          </button>
        </div>
      </header>

      <EnvironmentModal
        open={showEnvironment}
        onClose={() => setShowEnvironment(false)}
      />
    </>
  );
}

export default Header;