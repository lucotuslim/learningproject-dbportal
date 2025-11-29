"use client";

import { useEffect, useState } from "react";

interface ExportStatus {
  exportComment: string;
  totalDocumentsCount: number;
  processedDocumentPercentage: string;
  processedDocumentSuccessfulCount: number;
  processedDocumentFailedCount: number;
}

interface FailedDocument {
  documentId: string;
  reason: string;
}

interface ExportData {
  ExportStatus: ExportStatus;
  FailedDocuments: FailedDocument[];
}

export default function ResultPage() {
  const [data, setData] = useState<ExportData | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "RESULT_DATA") {
        setData(event.data.payload);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!data)
    return (
      <div className="p-6 text-gray-500">
        Waiting for export data from parent page...
      </div>
    );

  const { ExportStatus, FailedDocuments } = data;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Export Result</h1>

      {/* Export Status Section */}
      <section className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-2 text-gray-700">Export Status</h2>
        <table className="min-w-full text-sm text-gray-800">
          <tbody>
            <tr>
              <td className="py-1 font-medium">Comment:</td>
              <td>{ExportStatus.exportComment}</td>
            </tr>
            <tr>
              <td className="py-1 font-medium">Total Documents:</td>
              <td>{ExportStatus.totalDocumentsCount}</td>
            </tr>
            <tr>
              <td className="py-1 font-medium">Progress:</td>
              <td>{ExportStatus.processedDocumentPercentage}</td>
            </tr>
            <tr>
              <td className="py-1 font-medium">Successful:</td>
              <td>{ExportStatus.processedDocumentSuccessfulCount}</td>
            </tr>
            <tr>
              <td className="py-1 font-medium">Failed:</td>
              <td>{ExportStatus.processedDocumentFailedCount}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Failed Documents Section */}
      <section className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Failed Documents</h2>

        {FailedDocuments && FailedDocuments.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-gray-600 text-left">Document ID</th>
                <th className="border border-gray-300 px-3 py-2 text-gray-600 text-left">Reason</th>
              </tr>
            </thead>
            <tbody>
              {FailedDocuments.map((doc, idx) => (
                <tr key={idx} className="odd:bg-white even:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 font-mono text-gray-600">
                    {doc.documentId}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-600">
                    {doc.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-green-600 font-medium">No failed documents 🎉</p>
        )}
      </section>
    </div>
  );
}
