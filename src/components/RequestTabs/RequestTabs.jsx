import useRequestStore from "../../store/requestStore";

function RequestTabs() {
  const { activeTab, setActiveTab } = useRequestStore();

  const tabs = ["params", "headers", "body", "auth"];

  return (
    <div className="request-tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={activeTab === tab ? "active" : ""}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );
}

export default RequestTabs;