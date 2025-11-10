"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

interface PushResponse {
  url_token: string;
  payload: string;
  expire_after_days: number;
  expire_after_views: number;
  expired: boolean;
  created_at: string;
  updated_at: string;
}

interface ReportData {
  decPassword: PushResponse;
  decSftpPassword: PushResponse;
}

export default function ResultPage() {
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "RESULT_DATA") {
        // Ensure payload is an object

        setData(event.data.payload);

      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!data)
    return (
      <div className="p-6 text-gray-500">
        Waiting for decrypted password data from parent page...
      </div>
    );

  const { decPassword, decSftpPassword } = data;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Password Pusher Output</h1>

      {decPassword?.url_token && (
        <p >
          You can get Zipfile password at:{" "}
          <Link
            href={`${process.env.NEXT_PUBLIC_PWPUSHER_API_URL}p/${decPassword.url_token}`}
            className="text-blue-600 underline"
            target="_blank" // optional: open in new tab
            rel="noopener noreferrer"
          >
            {process.env.NEXT_PUBLIC_PWPUSHER_API_URL}/p/{decPassword.url_token}
          </Link>
          . It will expire after {decPassword.expire_after_days} days or {decPassword.expire_after_views} views.
        </p>
      )}

      {decSftpPassword?.url_token && (
        <p >
          You can get SFTP password at:{" "}
          <Link
            href={`${process.env.NEXT_PUBLIC_PWPUSHER_API_URL}p/${decSftpPassword.url_token}`}
            className="text-blue-600 underline"
            target="_blank" // optional: open in new tab
            rel="noopener noreferrer"
          >
            {process.env.NEXT_PUBLIC_PWPUSHER_API_URL}/p/{decSftpPassword.url_token}
          </Link>
          . It will expire after {decSftpPassword.expire_after_days} days or {decSftpPassword.expire_after_views} views.

        </p>
      )}

    </div>
  );
}
