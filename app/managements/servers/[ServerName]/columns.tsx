"use client"
import { ColumnDef } from "@tanstack/react-table"
import {IServerInfoDetails} from "@/interfaces/server"
import { IapiInfo } from "@/interfaces/generic"

import Link from "next/link"

export const columns: ColumnDef<IapiInfo<IServerInfoDetails>>[] = [
  { accessorKey: "apiurl", header: "Api Url" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "message", header: "Message" },
  { accessorKey: "error", header: "Error?" },
  { accessorKey: "ServerName", header: "Server Name", cell: ({ row }) => {
    const serverName = row.original.ServerName;
    if (!serverName) return null;
    return (
      <Link href={`/managements/servers/${serverName}`} className="text-blue-600 hover:underline">
        {serverName}
      </Link>
    );
  } },
  { accessorKey: "MachineName", header: "Machine Name" },
  { accessorKey: "Edition", header: "Edition" },
  { accessorKey: "ProductVersion", header: "Product Version" },
  { accessorKey: "ProductLevel", header: "Product Level" },
  { accessorKey: "InstanceName", header: "Instance Name" },
  { accessorKey: "IsClustered", header: "Clustered", cell: info => info.getValue() ? "Yes" : "No" },
  { accessorKey: "IsHadrEnabled", header: "HADR Enabled", cell: info => info.getValue() ? "Yes" : "No" },
  { accessorKey: "AuthenticationMode", header: "Auth Mode" },
  { accessorKey: "LicenseType", header: "License Type" },
  { accessorKey: "NumLicenses", header: "Licenses" },
  { accessorKey: "ProductBuild", header: "Product Build" },
  { accessorKey: "ProductBuildType", header: "Product Build Type" },
  { accessorKey: "ProductMajorVersion", header: "Product Major Version" },
  { accessorKey: "ProductMinorVersion", header: "Product Minor Version" },
  { accessorKey: "ProductUpdateLevel", header: "Product Update Level" },
  { accessorKey: "ProductUpdateReference", header: "Product Update Reference" },
  { accessorKey: "BuildClrVersion", header: "CLR Version" },
  { accessorKey: "Collation", header: "Collation" },
  { accessorKey: "CollationID", header: "Collation ID" },
  { accessorKey: "ComparisonStyle", header: "Comparison Style" },
  { accessorKey: "EngineEdition", header: "Engine Edition" },
  { accessorKey: "InstanceDefaultDataPath", header: "Default Data Path" },
  { accessorKey: "InstanceDefaultLogPath", header: "Default Log Path" },
  { accessorKey: "IsIntegratedSecurityOnly", header: "Integrated Security Only", cell: info => info.getValue() ? "Yes" : "No" },
  { accessorKey: "IsSingleUser", header: "Single User", cell: info => info.getValue() ? "Yes" : "No" },
  { accessorKey: "LCID", header: "LCID" },
  { accessorKey: "ProcessID", header: "Process ID" },
  { accessorKey: "ResourceLastUpdateDateTime", header: "Last Update" },
  { accessorKey: "ResourceVersion", header: "Resource Version" },
  { accessorKey: "SqlCharSet", header: "SQL CharSet" },
  { accessorKey: "SqlCharSetName", header: "SQL CharSet Name" },
  { accessorKey: "SqlSortOrder", header: "SQL Sort Order" },
  { accessorKey: "SqlSortOrderName", header: "SQL Sort Order Name" },
  { accessorKey: "Version", header: "SQL Server Version" },
  { accessorKey: "ClusterStatus", header: "Cluster Status" },
]


