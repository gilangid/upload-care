import React, { useEffect, useState } from "react";

  const getPreviewUrl = (file: any) => {
    if (!file) return "";

    // Get URL from file object or construct it
    let raw = file.cdnUrl || file.cdn_url || file.originalUrl;
    
    if (!raw && file.uuid) {
      raw = `https://15wuo2m5p6.ucarecd.net/${file.uuid}`;
    }

    if (!raw) return "";

    // Always convert ucarecdn.com URLs to use our account's domain
    raw = raw.replace('ucarecdn.com', '15wuo2m5p6.ucarecd.net');

    const cleaned = String(raw).replace(/\/+$/, "");
    const hasTransform = cleaned.includes("/-/");
    
    if (hasTransform) {
      if (cleaned.includes("/-/preview")) return cleaned;
      return `${cleaned}/-/preview/1000x1000/`;
    }

    return `${cleaned}/-/preview/1000x1000/`;
  };const UploadcareGallery: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("uploadcareFiles");
      if (raw) {
        setFiles(JSON.parse(raw));
      }
    } catch (err) {
      // ignore
    }
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Uploadcare Gallery</h2>
      <p>Files persisted from Uploadcare uploads (localStorage):</p>
      {files.length === 0 ? (
        <p>No files found. Upload a file first using the uploader page.</p>
      ) : (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {files.map((file) => (
            <div key={file.uuid} style={{ width: 220 }}>
              <img
                src={getPreviewUrl(file)}
                alt={file.name || file.uuid}
                style={{ width: "100%", height: "auto", display: "block" }}
                title={getPreviewUrl(file)}
              />
              <div style={{ fontSize: 12, marginTop: 6 }}>{file.name || file.uuid}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadcareGallery;
