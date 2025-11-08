"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner"
import { addDocExportOutput, fetchNamespace, fetchDocuments,submitBulkExport } from "./lib";
import { getApiToken } from "@/lib/utils";
import { encryptString, decryptString } from "@/lib/utils";
import { en } from "zod/v4/locales";

// [ExportGuid] [nvarchar](100) NULL,
// [Filename] [nvarchar](100) NULL,
// [Password] [nvarchar](100) NULL,
// [SftpUser] [nvarchar](100) NULL,
// [sftppassword] [nvarchar](100) NULL,
// [ContainerName] [nvarchar](100) NULL,
// [Namespace] [nvarchar](100) NULL,
// [CreatedBy] [nvarchar](100) NULL,
// [env] [varchar](50) NULL

const formSchema = z.object({
  env: z.string().min(1, "Environment is required"),
  Namespace: z.string().min(1, "Namespace is required"),
  Filename: z.string().min(1, "Filename is required"),
  SftpUser: z.string().min(1, "SFTP Username is required"),
  sftppassword: z.string().min(1, "SFTP Password is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function SubmitForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      env: "",
      Namespace: "",
      Filename: "",
      SftpUser: "",
      sftppassword: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const key = Buffer.from([
  1, 35, 69, 103, 137, 171, 205, 239,
  18, 52, 86, 120, 154, 188, 222, 241,
  17, 34, 51, 68, 85, 102, 119, 136,
  153, 170, 187, 204, 221, 238, 255, 0
]);

    setIsSubmitting(true);
    try {
      const namespace = await fetchNamespace("ServerInventory", values.Namespace);
      console.log("Fetched Namespace:", JSON.stringify(namespace));
      const documents = await fetchDocuments(namespace.ConstringServerName, namespace.ConstringDatabaseName);
      console.log("Fetched Documents:", JSON.stringify(documents));
      const containername = `${namespace.Namespace}-${namespace.ClientID}`;
      console.log("Container Name:", containername);
      const token = await getApiToken({
        Url: process.env.NEXT_PUBLIC_DocApiTokenUrl!,
        Method: process.env.NEXT_PUBLIC_DocApiTokenMethod!,
        ContentType: process.env.NEXT_PUBLIC_DocApiTokenContentType!,
        GrantType: process.env.NEXT_PUBLIC_DocApiGrantType!,
        ClientId: process.env.NEXT_PUBLIC_DocApiClientId!,
        Scope: process.env.NEXT_PUBLIC_DocApiScope!,
        ClientSecret: process.env.NEXT_PUBLIC_DocApiClientSecret!
      });
      console.log("Fetched API Token:", token.access_token);
      const submitBulkExportres = await submitBulkExport({
        Url: process.env.NEXT_PUBLIC_DocSubmitBulkExportUrl!,
        Method: process.env.NEXT_PUBLIC_DocSubmitBulkExportMethod!,
        sftpHostName: process.env.NEXT_PUBLIC_DocSubmitBulkExportHostName!,
        ContentType: process.env.NEXT_PUBLIC_DocSubmitBulkExportContentType!,
        Token: token.access_token,
        ContainerName: containername,
        ZipName: values.Filename,
        SftpUsername: values.SftpUser,
        SftpPassword: values.sftppassword,
        DocumentsGUID: documents
      });
      console.log("Submitted Bulk Export:", JSON.stringify(submitBulkExportres));

      // need to call before that
      const newvalue = {
        ...values,
        ExportGuid: submitBulkExportres["Export GUID"],
        Filename: submitBulkExportres["Export File Name"],
        Password: submitBulkExportres["Password"],
        ContainerName: containername
      }

      console.log(JSON.stringify(newvalue));
      const encsftppassword = encryptString(newvalue.sftppassword, key);
      newvalue.sftppassword = encsftppassword;
      const encpassword = encryptString(newvalue.Password, key);
      newvalue.Password = encpassword;

      const result = await addDocExportOutput("DocManagement", newvalue);
      toast.success(
        `Export created Guid: ${result.ExportGuid} Namespace: ${result.Namespace}`,
        { duration: 9000 }
      );
      //form.reset();
    } catch (error) {
      console.error((error as Error).message);
      toast.error((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-6 m-6">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="env">Environment</Label>
            <Input id="env" placeholder="Enter Environment" {...form.register("env")} />
          </div>

          <div>
            <Label htmlFor="Namespace">Namespace</Label>
            <Input id="Namespace" placeholder="Enter namespace" {...form.register("Namespace")} />
          </div>

          <div>
            <Label htmlFor="Filename">Filename</Label>
            <Input id="Filename" placeholder="Enter Zip filename" {...form.register("Filename")} />
          </div>

          <div>
            <Label htmlFor="SftpUser">SFTP Username</Label>
            <Input id="SftpUser" placeholder="Enter SFTP username" {...form.register("SftpUser")} />
          </div>

          <div>
            <Label htmlFor="SftpPassword">SFTP Password</Label>
            <Input
              id="SftpPassword"
              type="password"
              placeholder="Enter SFTP password"
              {...form.register("sftppassword")}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
}