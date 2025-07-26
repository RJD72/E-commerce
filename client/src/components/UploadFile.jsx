/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { FileUpload } from "./ui/file-upload";

const UploadFile = ({ onChange }) => {
  const [files, setFiles] = useState([]);
  const handleFileUpload = (newFiles) => {
    setFiles(newFiles);
    onChange(newFiles);
  };

  return (
    <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
      <FileUpload onChange={handleFileUpload} />
    </div>
  );
};

export default UploadFile;
