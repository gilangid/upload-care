import "./App.css";

import { useEffect, useState } from "react";
import UploadcareUploader from "./components/UploadcareUploader";
import UploadcareGallery from "./pages/UploadcareGallery";
import ListFiles from "./pages/ListFiles"; // Import the new component

function App() {
  const [route, setRoute] = useState<string>(window.location.hash || "#/");

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <>
      {/* <header style={{ display: "flex", gap: 12, alignItems: "center", padding: 12 }}>
        <h1 style={{ margin: 0 }}>React File Upload</h1>
        <nav style={{ marginLeft: 16 }}>
          <a href="#/" style={{ marginRight: 8 }}>
            Uploader
          </a>
          <a href="#/gallery" style={{ marginRight: 8 }}>
            Gallery
          </a>
          <a href="#/list-files">
            List Files
          </a>
        </nav>
      </header> */}

      <main style={{ padding: 0 }}>
        {route === "#/gallery" ? (
          <UploadcareGallery />
        ) : route === "#/list-files" ? (
          <ListFiles />
        ) : (
          <>
            <h2>Uploadcare File Uploader</h2>
            <UploadcareUploader />
            <p className="read-the-docs">This app is built with Vite and React.</p>
          </>
        )}
      </main>
    </>
  );
}

export default App;
