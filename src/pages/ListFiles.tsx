import React, { useEffect, useState } from "react";

const getPreviewUrl = (file: any) => {
  if (!file) return "";

  let raw = file.cdnUrl || file.cdn_url || file.originalUrl;

  if (!raw && file.uuid) {
    raw = `https://ucarecdn.com/${file.uuid}/`; // Use ucarecdn.com as base
  }

  if (!raw) return "";

  // Always convert ucarecdn.com URLs to use our account's domain if needed,
  // though for direct API calls, the CDN URL from the API should be fine.
  // For consistency with other components, we'll keep the replacement logic.
  raw = raw.replace('ucarecdn.com', '15wuo2m5p6.ucarecd.net'); // Replace with your actual CDN domain if different

  const cleaned = String(raw).replace(/\/+$/, "");
  const hasTransform = cleaned.includes("/-/");

  if (hasTransform) {
    if (cleaned.includes("/-/preview")) return cleaned;
    return `${cleaned}/-/preview/1000x1000/`;
  }

  return `${cleaned}/-/preview/1000x1000/`;
};

const ListFiles: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedUuid, setCopiedUuid] = useState<string | null>(null);

  const handleCopyUrl = (file: any) => {
    let url = file.cdnUrl || `https://ucarecdn.com/${file.uuid}/`;
    url = url.replace('ucarecdn.com', '15wuo2m5p6.ucarecd.net'); // Apply the domain replacement
    navigator.clipboard.writeText(url).then(
      () => {
        setCopiedUuid(file.uuid);
        setTimeout(() => setCopiedUuid(null), 2000); // Reset after 2 seconds
      },
      (err) => {
        console.error("Failed to copy: ", err);
      }
    );
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        setError(null);

        const publicKey = import.meta.env.VITE_UPLOADCARE_API_KEY;
        const secretKey = import.meta.env.VITE_UPLOADCARE_SECRET_KEY;

        if (!publicKey || !secretKey) {
          setError("Uploadcare API keys are not configured.");
          setLoading(false);
          return;
        }

        // WARNING: Exposing secret key in frontend is INSECURE.
        // For production, this should be moved to a backend service.
        const authHeader = `Uploadcare.Simple ${publicKey}:${secretKey}`;

        const response = await fetch("https://api.uploadcare.com/files/", {
          headers: {
            Accept: "application/vnd.uploadcare-v0.7+json",
            Authorization: authHeader,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed to fetch files: ${response.status} ${
              response.statusText
            } - ${JSON.stringify(errorData)}`
          );
        }

        const data = await response.json();
        // The API returns an object with a 'results' array
        setFiles(data.results || []);
      } catch (err: any) {
        setError(err.message || "An unknown error occurred.");
        console.error("Error fetching Uploadcare files:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  return (
    <div style={{ marginLeft: '25%' }}>
      <h2>Uploadcare Files</h2>
      {loading && <p>Loading files...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!loading && !error && files.length === 0 && (
        <p>No files found in your Uploadcare account.</p>
      )}
      {!loading && !error && files.length > 0 && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {files.map((file) => (
            <div
              key={file.uuid}
              style={{
                width: 220,
                border: "1px solid #eee",
                padding: 8,
                borderRadius: 4,
              }}
            >
              <img
                src={getPreviewUrl(file)}
                alt={file.original_filename || file.uuid}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  marginBottom: 8,
                }}
                title={file.original_filename || file.uuid}
              />
              <div style={{ fontSize: 12, wordBreak: "break-all" }}>
                <strong>Name:</strong> {file.original_filename || "N/A"}
              </div>
              <div style={{ fontSize: 12, wordBreak: "break-all" }}>
                <strong>UUID:</strong> {file.uuid}
              </div>
              <div style={{ fontSize: 12, wordBreak: "break-all" }}>
                <strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB
              </div>
              <div style={{ fontSize: 12, wordBreak: "break-all" }}>
                <strong>Uploaded:</strong>{" "}
                {new Date(file.datetime_uploaded).toLocaleDateString()}
              </div>
              <button
                onClick={() => handleCopyUrl(file)}
                style={{ marginTop: 8, width: "100%" }}
              >
                {copiedUuid === file.uuid ? "Copied!" : "Copy URL"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListFiles;
