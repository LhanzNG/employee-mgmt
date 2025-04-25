import React from "react";
import { FileText, Download, Trash2 } from "lucide-react";
import { Document } from "../types/document";

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: number) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onDelete }) => {
  if (documents.length === 0) {
    return null; // Do not render anything if there are no documents
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-primary mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {doc.document_type}
              </h3>
              <p className="text-xs text-gray-500">
                Uploaded on {new Date(doc.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href={doc.document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/90"
              download
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={() => onDelete(doc.id)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;
