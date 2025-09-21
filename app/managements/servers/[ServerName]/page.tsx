"use client"

import { IapiInfo } from "@/interfaces/generic";
import { IServerInfoDetails } from "@/interfaces/server";
import { getServerByName } from "@/lib/rxjs/servers/servers";
import { map } from "rxjs";
import { useParams } from "next/navigation";
import { useObservable } from "rxjs-hooks";
import { of } from "rxjs";

export default function Page() {
  const params = useParams() // team === "nextjs"
  const serverName = Array.isArray(params.ServerName)
    ? params.ServerName[0]
    : params.ServerName;

  const data = useObservable<IapiInfo<IServerInfoDetails> | null>(() => {
    if (!serverName) {
      return of(null);
    }
    // getServerByName returns an array, so map to first row or null
    return getServerByName<IServerInfoDetails>(serverName).pipe(
      map((rows: IapiInfo<IServerInfoDetails>[]) =>   rows[0] )
    );
  }, null);

  if (!data) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }
  return (
    <div className="container mx-auto py-10">
      <ServerDetails data={data} />
    </div>
  );
// Simple details component for a single server
function ServerDetails({ data }: { data: IapiInfo<IServerInfoDetails> }) {
  if (!data) return  (
    <div>No server details available</div>
  );
  const details = data as IapiInfo<IServerInfoDetails>;
  return (
    <div className=" shadow rounded p-6">
      <h2 className="text-xl font-bold mb-4">Server Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Server Name:</strong> {details.ServerName}</div>
        <div><strong>Machine Name:</strong> {details.MachineName}</div>
        <div><strong>Edition:</strong> {details.Edition}</div>
        <div><strong>Product Version:</strong> {details.ProductVersion}</div>
        <div><strong>Product Level:</strong> {details.ProductLevel}</div>
        <div><strong>Instance Name:</strong> {details.InstanceName}</div>
        <div><strong>Clustered:</strong> {details.IsClustered ? "Yes" : "No"}</div>
        <div><strong>HADR Enabled:</strong> {details.IsHadrEnabled ? "Yes" : "No"}</div>
        <div><strong>Authentication Mode:</strong> {details.AuthenticationMode}</div>
        <div><strong>License Type:</strong> {details.LicenseType}</div>
        <div><strong>Num Licenses:</strong> {details.NumLicenses}</div>
        <div><strong>Product Build:</strong> {details.ProductBuild}</div>
        <div><strong>Resource Last Update:</strong> {details.ResourceLastUpdateDateTime?.toString()}</div>
        {/* Add more fields as needed */}
      </div>
      <div className="mt-6">
        <strong>Message:</strong> {details.message}<br />
        <strong>Error:</strong> {details.error ? "Yes" : "No"}
      </div>
    </div>
  );
}
}



