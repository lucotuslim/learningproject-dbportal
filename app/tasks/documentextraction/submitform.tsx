"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { addDocExportOutput, fetchNamespace, fetchDocuments } from "./serverlib";
import { encryptString } from "@/lib/serverutils"
import { DocumentExtractionTasksSetting } from "@/app/tasks/documentextraction/appconfig";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IDocumentConfig } from "./interfaces"
import { chunkArray } from '@/lib/serverutils'
import { useGlobalSetting } from "@/lib/store";
import { getApiToken } from "@/lib/serverutils"

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
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [DocumentConfig, setDocumentConfig] = useState<IDocumentConfig[]>([]);
  const selectedEnvironment = useGlobalSetting((state) => state.selectedEnvironment);
  const globalSettings = useGlobalSetting((state) => state.globalSettings);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await DocumentExtractionTasksSetting();
        setDocumentConfig(config);
      } finally {
        setIsConfigLoading(false);
      }
    };
    loadConfig();
  }, []);

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

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    // reset,
  } = form;

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {

      const namespace = await fetchNamespace(globalSettings!.SERVERINVENTORY, values.Namespace, selectedEnvironment);
      console.log(JSON.stringify(namespace));
      if (!namespace) throw new Error("Namespace not found");
      const documents: { DocumentGUID: string }[] = await fetchDocuments(namespace.ConstringServerName, namespace.ConstringDatabaseName);
      if (documents.length===0) { toast.warning("No document found.")}
      const containername = `${namespace.Namespace}-${namespace.ClientID}`;

      // const tokenres = await fetch("/api/getapitoken", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ env: values.env }),
      // })
      // const token = await tokenres.json() as TokenResponse
      const currentconfig = DocumentConfig.find((e) => e.env === values.env)
      console.log(JSON.stringify(currentconfig));

      const token = await getApiToken({
        Url: currentconfig!.GetDocApiToken.Url,
        Method: currentconfig!.GetDocApiToken.Method,
        ContentType: currentconfig!.GetDocApiToken.ContentType,
        GrantType: currentconfig!.GetDocApiToken.GrantType,
        ClientId: currentconfig!.GetDocApiToken.ClientId,
        Scope: currentconfig!.GetDocApiToken.Scope,
      });

      //       const token = await getApiToken({
      //   Url: currentconfig.GetDocApiToken.Url,
      //   Method: currentconfig.GetDocApiToken.Method,
      //   ContentType: currentconfig.GetDocApiToken.ContentType,
      //   GrantType: currentconfig.GetDocApiToken.GrantType,
      //   ClientId: process.env.NEXT_PUBLIC_DocApiClientId!,
      //   Scope: process.env.NEXT_PUBLIC_DocApiScope!,
      //   ClientSecret: process.env.DocApiClientSecret!,
      // });

      const BATCH_SIZE = 50000;
      const batches = await chunkArray(documents, BATCH_SIZE);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        const submitBulkExportParams = {
          Url: selectedEnvConfig!.SendDocBulkExport.Url,
          Method: selectedEnvConfig!.SendDocBulkExport.Method,
          sftpHostName: selectedEnvConfig!.SendDocBulkExport.sftpHostName,
          ContentType: selectedEnvConfig!.SendDocBulkExport.ContentType,
          Token: token.access_token,
          ContainerName: containername,
          ZipName: values.Filename,
          SftpUsername: values.SftpUser,
          sftppassword: values.sftppassword,
          DocumentsGUID: batch
          //  DocumentsGUID: documents, // large array OK for API route
        };

        const bulksubmitres = await fetch('/api/documentextraction/submitBulkExport', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitBulkExportParams),
        });
        //const bulksubmitres = await submitBulkExport(submitBulkExportParams);

        // Parse the JSON response
        if (!bulksubmitres.ok) {
          const errText = await bulksubmitres.text();
          throw new Error(`submitBulkExport failed: ${bulksubmitres.status} ${bulksubmitres.statusText} — ${errText}`);
        }

        const submitBulkExportres = await bulksubmitres.json();
        const newvalue = {
          ...values,
          ExportGuid: submitBulkExportres["Export GUID"],
          Filename: submitBulkExportres["Export File Name"],
          Password: submitBulkExportres["Password"],
          ContainerName: containername,
        };

        const encsftppassword = await encryptString(newvalue.sftppassword);
        newvalue.sftppassword = encsftppassword;

        const encpassword = await encryptString(newvalue.Password);
        newvalue.Password = encpassword;

        const result = await addDocExportOutput("DocumentManagement", newvalue);
        toast.success(`Export created Guid: ${result.ExportGuid} Namespace: ${result.Namespace}`, {
          duration: 9000,
        });
      }
      // reset(); // enable if you want to clear form after success
    } catch (error) {
      console.error((error as Error).message);
      toast.error(`Submission failed: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [selectedEnvConfig, setSelectedEnvConfig] = useState<IDocumentConfig | null>(null);


  if (isConfigLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <span className="text-muted-foreground">Loading configuration…</span>
      </div>
    );
  } else {

    return (
      // center the form and keep a consistent max width so inputs + button match
      <div className="flex justify-center p-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md rounded-lg shadow-sm"
        >
          {/* disable form controls while submitting */}
          <fieldset disabled={isSubmitting} className="space-y-4">
            <CardContent className="space-y-4 p-6">
              {/* Environment select */}
              <div>
                <Label htmlFor="env">Environment</Label>
                <Controller
                  control={control}
                  name="env"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(val: string) => {
                        field.onChange(val); // updates form value
                        // find and store the config for that environment
                        const envConfig = DocumentConfig.find((item) => item.env === val);
                        setSelectedEnvConfig(envConfig ?? null);
                      }}
                    >
                      <SelectTrigger className="w-full mt-1">            {/* put className here */}
                        <SelectValue placeholder="Select Environment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Environments</SelectLabel>

                          {/* {DocumentConfig.map((item) => (
                          <SelectItem key={item.env} value={item.env}>
                            {item.env}
                          </SelectItem>
                        ))} */}

                          {DocumentConfig.map((item, idx) => (
                            <SelectItem
                              key={idx}
                              value={item.env}
                            >
                              {item.env}
                            </SelectItem>
                          ))}

                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />

                {errors.env && <p className="text-sm text-red-600 mt-1">{errors.env.message}</p>}
              </div>

              {/* Namespace */}
              <div>
                <Label htmlFor="Namespace">Namespace</Label>
                <Input id="Namespace" placeholder="Enter namespace" {...register("Namespace")} className="w-full mt-1" />
                {errors.Namespace && <p className="text-sm text-red-600 mt-1">{errors.Namespace.message}</p>}
              </div>

              {/* Filename */}
              <div>
                <Label htmlFor="Filename">Filename</Label>
                <Input id="Filename" placeholder="Enter Zip filename" {...register("Filename")} className="w-full mt-1" />
                {errors.Filename && <p className="text-sm text-red-600 mt-1">{errors.Filename.message}</p>}
              </div>

              {/* SFTP Username */}
              <div>
                <Label htmlFor="SftpUser">SFTP Username</Label>
                <Input id="SftpUser" placeholder="Enter SFTP username" {...register("SftpUser")} className="w-full mt-1" />
                {errors.SftpUser && <p className="text-sm text-red-600 mt-1">{errors.SftpUser.message}</p>}
              </div>

              {/* SFTP Password */}
              <div>
                <Label htmlFor="SftpPassword">SFTP Password</Label>
                <Input
                  id="SftpPassword"
                  type="password"
                  placeholder="Enter SFTP password"
                  {...register("sftppassword")}
                  className="w-full mt-1"
                />
                {errors.sftppassword && <p className="text-sm text-red-600 mt-1">{errors.sftppassword.message}</p>}
              </div>
            </CardContent>

            <CardFooter className="p-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </CardFooter>
          </fieldset>
        </form>
      </div>
    );
  }
}
