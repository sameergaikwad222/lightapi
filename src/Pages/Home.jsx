import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import RequestBar from "../components/RequestBar/RequestBar";
import RequestTabs from "../components/RequestTabs/RequestTabs";
import RequestEditor from "../components/RequestEditor/RequestEditor";
import ResponseViewer from "../components/ResponseViewer/ResponseViewer";

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
          <RequestEditor />
          <ResponseViewer />
        </div>
      </div>
    </div>
  );
}

export default Home;