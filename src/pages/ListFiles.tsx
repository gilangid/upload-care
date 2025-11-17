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

  const handleDelete = async (uuid: string) => {
    if (!window.confirm("Do you want erase this file from your gallery?")) {
      return;
    }

    try {
      const publicKey = import.meta.env.VITE_UPLOADCARE_API_KEY;
      const secretKey = import.meta.env.VITE_UPLOADCARE_SECRET_KEY;

      if (!publicKey || !secretKey) {
        setError("Uploadcare API keys are not configured.");
        return;
      }

      const authHeader = `Uploadcare.Simple ${publicKey}:${secretKey}`;

      const response = await fetch(`https://api.uploadcare.com/files/${uuid}/`, {
        method: 'DELETE',
        headers: {
          Accept: "application/vnd.uploadcare-v0.5+json",
          Authorization: authHeader,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to delete file: ${response.status} ${
            response.statusText
          } - ${JSON.stringify(errorData)}`
        );
      }

      // Remove the file from the state
      setFiles(files.filter((file) => file.uuid !== uuid));

    } catch (err: any) {
      setError(err.message || "An unknown error occurred while deleting the file.");
      console.error("Error deleting Uploadcare file:", err);
    }
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
            Accept: "application/vnd.uploadcare-v0.5+json",
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
    <div style={{ marginLeft: '0%' }}>
      <h2>All Images & Files</h2>
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
              <div style={{ display: "flex", marginTop: 8 }}>
                <button
                  onClick={() => handleCopyUrl(file)}
                  style={{ flex: 1 }}
                >
                  {copiedUuid === file.uuid ? "Copied!" : "Copy URL"}
                </button>
                <button
                  onClick={() => handleDelete(file.uuid)}
                  style={{
                    marginLeft: 4,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                  title="Delete File"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-trash3"
                    viewBox="0 0 16 16"
                  >
                    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListFiles;
