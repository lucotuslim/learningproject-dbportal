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
import { AppConfigForm } from "./appconfigform";
import { Label } from "@/components/ui/label"

export default function AppConfigPage() {
  const [DocumentConfig, setDocumentConfig] = useState<IDocumentConfig[]>([]);
  const [SelectedConfig, setSelectedConfig] = useState<IDocumentConfig | null>(null);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false)
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
        <AppConfigForm
          row={isAdding ? null : SelectedConfig}
          onSave={async (id, values) => {
            if (id) {
              // UPDATE existing
              //await SelectedConfig(id, values)
            } else {
              // CREATE new
              //await SelectedConfig(values)
            }
            setIsAdding(false)
          }}
          onAddCancel={() => setIsAdding(false)}
        />
      </div>


    </div>
  );
}