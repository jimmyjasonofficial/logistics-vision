"use client";

import { getDownloadUrl, uploadFile } from "@/services/storage-service";
import { useState } from "react";

interface ImageUploaderProps {
  onUpload?: (url: string) => void; // parent ko URL bhejne ke liye
}

export default function ImageUploader({ onUpload }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const { gsPath } = await uploadFile(file, "employees");

      const downloadUrl = await getDownloadUrl(gsPath);

      if (downloadUrl) {
        setUrl(downloadUrl);

        // Agar parent ko chahiye to url callback bhej do
        if (onUpload) onUpload(downloadUrl);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {uploading && <p className="text-blue-500">Uploading...</p>}

      {url && (
        <div>
          <p className="text-green-600">Uploaded Successfully!</p>
          <img
            src={url}
            alt="Preview"
            className="w-40 h-40 object-cover border rounded"
          />
          <p className="text-sm break-all">{url}</p>
        </div>
      )}
    </div>
  );
}
