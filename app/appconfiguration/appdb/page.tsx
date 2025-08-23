"use client";

import { useEffect, useState } from "react";
import { Subscription } from "rxjs";
import { getApiEndpoint } from "@/lib/rxjs";

export default function RxjsServer() {
  const [message, setMessage] = useState< {Servername: string , ServerUrl: string}>({Servername: "", ServerUrl: ""});

  useEffect(() => {
    // Call our RxJS function with a server name
    const observable$ = getApiEndpoint("sql-prod", "databases");

    // Subscribe to the observable
    const subscription: Subscription = observable$.subscribe((val) => {
      setMessage(val);
    });

    // Cleanup on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">RxJS Server Formatter</h1>
      <p className="text-lg mt-4">{message.ServerUrl}</p>
    </div>
  );
}
