import { DocumentExtractionTasksSetting } from "@/app/tasks/documentextraction/appconfig";
import { useEffect, useState } from "react";
import { IDocumentConfig } from "../interfaces";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input";

function Field({
  label,
  type = "text",
  text 
}: {
  label: string
  type?: string
  text?: string
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={label}>{label}</Label>
      <Input id={label} type={type} defaultValue={text} />
    </div>
  )
}

export default function AppConfigPage() {
  const [DocumentConfig, setDocumentConfig] = useState<IDocumentConfig[]>([]);
  const [SelectedConfig, setSelectedConfig] = useState<IDocumentConfig | null>(null);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

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


  if (isConfigLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <span className="text-muted-foreground">Loading configuration…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:flex-row">
      {/* Left */}
      <div className="md:w-1/4 space-y-2">
        <Label htmlFor="environment">Select Environment</Label>

        <Select
          onValueChange={(env) => {
            const config = DocumentConfig.find(c => c.env === env) || null
            setSelectedConfig(config)
          }}
        >          <SelectTrigger className="w-full mt-1" id="environment">
            <SelectValue placeholder="Choose environment" />
          </SelectTrigger>
          <SelectContent>
            {DocumentConfig.map((item, idx) => (
              <SelectItem
                key={idx}
                value={item.env}
              >
                {item.env}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Right */}
      <div className="flex-1 space-y-2">


        {/* GetDocApiToken */}
        <Card>
          <CardHeader>
            <CardTitle>GetDocApiToken</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Field label="Url" text={SelectedConfig?.GetDocApiToken?.Url} />
            <Field label="Method" text={SelectedConfig?.GetDocApiToken?.Method} />
            <Field label="ContentType" text={SelectedConfig?.GetDocApiToken?.ContentType} />
            <Field label="GrantType" text={SelectedConfig?.GetDocApiToken?.GrantType} />
            <Field label="ClientId" text={SelectedConfig?.GetDocApiToken?.ClientId} />
            <Field label="Scope" text={SelectedConfig?.GetDocApiToken?.Scope} />
          </CardContent>
        </Card>

        {/* SendDocBulkExport */}
        <Card>
          <CardHeader>
            <CardTitle>SendDocBulkExport</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Field label="Url" text={SelectedConfig?.SendDocBulkExport?.Url} />
            <Field label="Method" text={SelectedConfig?.SendDocBulkExport?.Method} />
            <Field label="ContentType" text={SelectedConfig?.SendDocBulkExport?.ContentType} />
            <Field label="sftpHostName" text={SelectedConfig?.SendDocBulkExport?.sftpHostName} />
          </CardContent>
        </Card>

        {/* GetDocBulkExportStatus */}
        <Card>
          <CardHeader>
            <CardTitle>GetDocBulkExportStatus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Field label="Url" text={SelectedConfig?.GetDocBulkExportStatus?.Url} />
            <Field label="Method" text={SelectedConfig?.GetDocBulkExportStatus?.Method} />
            <Field label="ContentType" text={SelectedConfig?.GetDocBulkExportStatus?.ContentType} />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}