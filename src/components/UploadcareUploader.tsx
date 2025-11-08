import React, { useCallback, useEffect, useRef, useState } from "react";

import * as LR from "@uploadcare/blocks";
import { PACKAGE_VERSION } from "@uploadcare/blocks/env";

import "./UploadcareUploader.css";

LR.registerBlocks(LR);

const UploadcareUploader = () => {
  const dataOutputRef = useRef<LR.DataOutput>();
  const [files, setFiles] = useState<any[]>([]);

  const handleUploaderEvent = useCallback((e: CustomEvent<any>) => {
    const { data } = e.detail;
    setFiles(data);

    try {
      // Persist files to localStorage so gallery page can show them across navigation/reloads.
      if (Array.isArray(data)) {
        // Keep only needed fields to avoid storing large objects.
        const toStore = data.map((f: any) => ({ uuid: f.uuid, cdnUrl: f.cdnUrl || f.cdn_url || f.originalUrl, name: f.name }));
        localStorage.setItem("uploadcareFiles", JSON.stringify(toStore));
      }
    } catch (err) {
      // ignore storage errors
      // console.warn('Could not persist uploadcare files:', err);
    }
  }, []);

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

    // Default: append the preview transform.
    return `${cleaned}/-/preview/1000x1000/`;
  };

  useEffect(() => {
    const el = dataOutputRef.current;

    el?.addEventListener(
      "lr-data-output",
      handleUploaderEvent as EventListenerOrEventListenerObject
    );
    return () => {
      el?.removeEventListener(
        "lr-data-output",
        handleUploaderEvent as EventListenerOrEventListenerObject
      );
    };
  }, [handleUploaderEvent]);

  return (
    <section
      style={
        {
          "--uploadcare-pubkey": `"${import.meta.env.VITE_UPLOADCARE_API_KEY}"`,
        } as React.CSSProperties
      }
    >
      <lr-file-uploader-regular
        class="uploaderCfg"
        css-src={`https://unpkg.com/@uploadcare/blocks@${PACKAGE_VERSION}/web/file-uploader-regular.min.css`}
      >
        <lr-data-output
          ref={dataOutputRef}
          use-event
          hidden
          class="uploaderCfg"
          onEvent={handleUploaderEvent}
        ></lr-data-output>
      </lr-file-uploader-regular>

      <div className="img-gallery">
        {files.map((file) => (
          <img
            key={file.uuid}
            src={getPreviewUrl(file)}
            alt="Preview"
            className="img-preview"
          />
        ))}
      </div>
    </section>
  );
};

export default UploadcareUploader;
