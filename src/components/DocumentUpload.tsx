import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { supabase } from "../lib/supabase";
import Input from "../components/Input";

interface DocumentUploadProps {
  onUpload?: (files: { [key: string]: File }) => Promise<void>;
  defaultDocuments?: string[];
  employeeId: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUpload,
  defaultDocuments = ["Employee's Resume", "Job Offer", "Employee Contract"],
  employeeId,
}) => {
  const [documents, setDocuments] = useState(defaultDocuments);
  const [documentInputs, setDocumentInputs] = useState<{
    [key: string]: File | null;
  }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [uploadComplete, setUploadComplete] = useState(false);

  useEffect(() => {
    const fetchCustomDocuments = async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("document_type")
        .eq("employee_id", employeeId)
        .is("document_url", null);

      if (error) {
        console.error("Error fetching custom documents:", error.message);
        return;
      }

      if (data) {
        const customLabels = data.map((doc) => doc.document_type);
        setDocuments((prev) => [...prev, ...customLabels]);
      }
    };

    fetchCustomDocuments();
  }, [employeeId]);

  const handleFileChange = (label: string, file: File | null) => {
    setDocumentInputs((prev) => ({ ...prev, [label]: file }));
  };

  const handleAddDocumentField = async () => {
    const newField = prompt("Enter new document label:");
    if (newField) {
      setDocuments((prev) => [...prev, newField]);
      setDocumentInputs((prev) => ({ ...prev, [newField]: null }));
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    setUploadComplete(false);
    try {
      const validDocs: { [key: string]: File } = {};
      for (const [label, file] of Object.entries(documentInputs)) {
        if (file) validDocs[label] = file;
      }

      for (const [label, file] of Object.entries(validDocs)) {
        // Generate a unique file name by appending a timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const uniqueFileName = `${label}-${timestamp}-${file.name}`;
        const filePath = `${employeeId}/${uniqueFileName}`;

        console.log(`Uploading file: ${file.name} to path: ${filePath}`);

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate delay
          setUploadProgress((prev) => ({ ...prev, [label]: progress }));
        }

        // Upload file to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from("employee-documents")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError.message);
          continue;
        }

        console.log(`File uploaded successfully: ${filePath}`);

        // Get public URL of the uploaded file
        const publicUrlData = supabase.storage
          .from("employee-documents")
          .getPublicUrl(filePath);

        const publicUrl = publicUrlData?.data?.publicUrl;

        if (!publicUrl) {
          console.error("Failed to retrieve public URL for:", filePath);
          continue;
        }

        console.log(`Public URL retrieved: ${publicUrl}`);

        // Insert document metadata into the database
        const { error: insertError } = await supabase.from("documents").insert([
          {
            employee_id: employeeId,
            document_type: label,
            document_url: publicUrl,
          },
        ]);

        if (insertError) {
          console.error("Insert error:", insertError.message);
        } else {
          console.log(`Document metadata inserted for: ${label}`);
        }
      }

      console.log("All documents uploaded successfully.");
      setUploadComplete(true);
    } catch (error) {
      console.error("Unexpected error during upload:", error);
    } finally {
      setUploading(false);
      setDocumentInputs({});
    }
  };

  const handleSubmit = async () => {
    if (onUpload) {
      await onUpload(documentInputs as { [key: string]: File });
    } else {
      await handleUpload();
    }
  };

  return (
    <div className="space-y-4">
      {documents.map((doc, idx) => (
        <div key={idx}>
          <label className="block text-sm font-medium text-gray-700">
            {doc}
          </label>
          <Input
            type="file"
            onChange={(e) => handleFileChange(doc, e.target.files?.[0] || null)}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
          />
          {uploadProgress[doc] !== undefined && (
            <div className="text-sm text-gray-600 mt-1">
              Uploading: {uploadProgress[doc]}%
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddDocumentField}
        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
      >
        <Plus className="w-4 h-4 inline-block mr-2" />
        Add Another Document
      </button>
      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload Files"}
        </button>
      </div>
      {uploadComplete && (
        <div className="text-green-600 text-sm mt-4">
          All files have been uploaded successfully!
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
