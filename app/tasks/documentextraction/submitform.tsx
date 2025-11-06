"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner"
import { addDocExportOutput, fetchNamespace,fetchDocuments } from "./lib";


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
    setIsSubmitting(true);
    try {
      const namespace = await fetchNamespace("ServerInventory", values.Namespace);
      console.log("Fetched Namespace:", JSON.stringify(namespace));
      const documents = await fetchDocuments(namespace.ConstringServerName, namespace.ConstringDatabaseName);
      console.log("Fetched Documents:", JSON.stringify(documents));
      const containername = `${namespace.Namespace}-${namespace.ClientID}`;
      console.log("Container Name:", containername);
      // need to call before that
      const newvalue = {
        ...values,
        ExportGuid:  Math.random().toString(36).substring(2, 15)
      }
      console.log  (JSON.stringify (newvalue));
      const result = await addDocExportOutput("DocManagement", newvalue);
      toast.success(
        `Export created Guid: ${result.ExportGuid} Namespace: ${result.Namespace}`,
        { duration: 5000 }
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