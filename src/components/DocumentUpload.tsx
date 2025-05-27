import React, { useState, useEffect } from "react";
import { SendHorizontal, Check, Trash2, X } from "lucide-react";
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
  const [uploadedDocuments, setUploadedDocuments] = useState<{
    [key: string]: { id: number; url: string };
  }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [uploadComplete, setUploadComplete] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [otherDocuments, setOtherDocuments] = useState<
    {
      id: number;
      document_type: string;
      document_url: string;
    }[]
  >([]);

  useEffect(() => {
    const fetchUploadedDocuments = async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("employee_id", employeeId);

      if (error) {
        console.error("Error fetching documents:", error.message);
        return;
      }

      if (data) {
        // Separate default documents and other documents
        const defaultDocs = {};
        const others = [];

        for (const doc of data) {
          if (defaultDocuments.includes(doc.document_type)) {
            defaultDocs[doc.document_type] = {
              id: doc.id,
              url: doc.document_url,
            };
          } else {
            others.push(doc);
          }
        }

        setUploadedDocuments(defaultDocs);
        setOtherDocuments(others);
      }
    };

    fetchUploadedDocuments();
  }, [employeeId, defaultDocuments]);

  const handleFileChange = (label: string, file: File | null) => {
    setDocumentInputs((prev) => ({ ...prev, [label]: file }));
  };

  const handleDeleteDocument = async (docType: string) => {
    const doc = uploadedDocuments[docType];
    if (!doc) return;

    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", doc.id);

      if (error) throw error;

      setUploadedDocuments((prev) => {
        const updated = { ...prev };
        delete updated[docType];
        return updated;
      });
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleDeleteOtherDocument = async (id: number) => {
    try {
      const { error } = await supabase.from("documents").delete().eq("id", id);

      if (error) throw error;

      setOtherDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setDroppedFiles((prev) => [...prev, ...files]);
  };

  const handleDropZoneClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = (e: any) => {
      const files = Array.from(e.target.files);
      setDroppedFiles((prev) => [...prev, ...files]);
    };
    input.click();
  };

  const handleRemoveDroppedFile = (index: number) => {
    setDroppedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadDroppedFiles = async () => {
    setUploading(true);
    setUploadComplete(false);
    try {
      for (const file of droppedFiles) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const uniqueFileName = `Other-${timestamp}-${file.name}`;
        const filePath = `${employeeId}/${uniqueFileName}`;

        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
        }

        const { error: uploadError } = await supabase.storage
          .from("employee-documents")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError.message);
          continue;
        }

        const publicUrlData = supabase.storage
          .from("employee-documents")
          .getPublicUrl(filePath);

        const publicUrl = publicUrlData?.data?.publicUrl;

        if (!publicUrl) {
          console.error("Failed to retrieve public URL for:", filePath);
          continue;
        }

        const { data, error: insertError } = await supabase
          .from("documents")
          .insert([
            {
              employee_id: employeeId,
              document_type: file.name,
              document_url: publicUrl,
            },
          ])
          .select()
          .single();

        if (insertError) {
          console.error("Insert error:", insertError.message);
        } else if (data) {
          setOtherDocuments((prev) => [...prev, data]);
        }
      }
      setUploadComplete(true);
      setDroppedFiles([]);
    } catch (error) {
      console.error("Unexpected error during upload:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (onUpload) {
      await onUpload(documentInputs as { [key: string]: File });
    } else {
      setUploading(true);
      setUploadComplete(false);
      try {
        const validDocs: { [key: string]: File } = {};
        for (const [label, file] of Object.entries(documentInputs)) {
          if (file) validDocs[label] = file;
        }

        for (const [label, file] of Object.entries(validDocs)) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const uniqueFileName = `${label}-${timestamp}-${file.name}`;
          const filePath = `${employeeId}/${uniqueFileName}`;

          for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            setUploadProgress((prev) => ({ ...prev, [label]: progress }));
          }

          const { error: uploadError } = await supabase.storage
            .from("employee-documents")
            .upload(filePath, file);

          if (uploadError) {
            console.error("Upload error:", uploadError.message);
            continue;
          }

          const publicUrlData = supabase.storage
            .from("employee-documents")
            .getPublicUrl(filePath);

          const publicUrl = publicUrlData?.data?.publicUrl;

          if (!publicUrl) {
            console.error("Failed to retrieve public URL for:", filePath);
            continue;
          }

          const { data, error: insertError } = await supabase
            .from("documents")
            .insert([
              {
                employee_id: employeeId,
                document_type: label,
                document_url: publicUrl,
              },
            ])
            .select()
            .single();

          if (insertError) {
            console.error("Insert error:", insertError.message);
          } else if (data) {
            setUploadedDocuments((prev) => ({
              ...prev,
              [label]: {
                id: data.id,
                url: data.document_url,
              },
            }));
          }
        }
        setUploadComplete(true);
      } catch (error) {
        console.error("Unexpected error during upload:", error);
      } finally {
        setUploading(false);
        setDocumentInputs({});
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Default document fields */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Required Documents</h3>
        {documents.map((doc, idx) => (
          <div key={idx} className="relative">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {doc}
              </label>
              {uploadedDocuments[doc] && (
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <button
                    onClick={() => handleDeleteDocument(doc)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <Input
              type="file"
              value={""}
              onChange={(e) =>
                handleFileChange(doc, e.target.files?.[0] || null)
              }
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
              disabled={!!uploadedDocuments[doc]}
            />
            {uploadProgress[doc] !== undefined && (
              <div className="text-sm text-gray-600 mt-1">
                Uploading: {uploadProgress[doc]}%
              </div>
            )}
          </div>
        ))}
        {Object.keys(documentInputs).length > 0 && (
          <button
            onClick={handleSubmit}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
            disabled={uploading}
          >
            {uploading ? (
              "Uploading..."
            ) : (
              <>
                Upload Required Documents
                <SendHorizontal className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Other uploaded documents */}
      {otherDocuments.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Additional Documents</h3>
          <div className="space-y-2">
            {otherDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-900">
                  {doc.document_type}
                </span>
                <div className="flex items-center space-x-2">
                  <a
                    href={doc.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDeleteOtherDocument(doc.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop zone for other files */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">
          Upload Additional Documents
        </h3>
        <div
          className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:bg-gray-50"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={handleDropZoneClick}
        >
          <div className="text-gray-500">
            Drag and drop files here, or click to select files
          </div>
          {droppedFiles.length > 0 && (
            <ul className="mt-2">
              {droppedFiles.map((file, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between text-sm text-gray-700 bg-gray-100 rounded px-2 py-1 mt-1"
                >
                  <span className="truncate max-w-xs">{file.name}</span>
                  <button
                    type="button"
                    className="ml-2 text-red-500 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveDroppedFile(idx);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {droppedFiles.length > 0 && (
          <button
            onClick={handleUploadDroppedFiles}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
            disabled={uploading}
          >
            {uploading ? (
              "Uploading..."
            ) : (
              <>
                Upload Additional Documents
                <SendHorizontal className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        )}
      </div>

      {uploadComplete && (
        <div className="text-green-600 text-sm">
          All files have been uploaded successfully!
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
