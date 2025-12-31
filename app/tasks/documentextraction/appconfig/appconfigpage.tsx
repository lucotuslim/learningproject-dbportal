import { toast } from "sonner";
import { UpdateDocumentExtractionTasksSetting,DeleteDocumentExtractionTasksSetting, DocumentExtractionTasksSetting } from "@/app/tasks/documentextraction/appconfig";
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
import { Button } from "@/components/ui/button";
import {AddDocumentExtractionTasksSetting} from "../appconfig";
export default function AppConfigPage() {
  const [DocumentConfig, setDocumentConfig] = useState<IDocumentConfig[]>([]);
  const [SelectedConfig, setSelectedConfig] = useState<IDocumentConfig| null >(null);
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

  const handleSaveConfig = async (config: IDocumentConfig) => {
  try {
    if (SelectedConfig) {
      await UpdateDocumentExtractionTasksSetting(config);
      toast.success("Configuration updated successfully.")
    } else {
      await AddDocumentExtractionTasksSetting(config)
      toast.success("Configuration added successfully.")
    }
    const updated = await DocumentExtractionTasksSetting()
    setDocumentConfig(updated)
    setSelectedConfig(config)
    setIsAdding(false)
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    toast.error(`Failed to save configuration: ${errorMessage}`)
  }
}

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
          disabled={isAdding}
          onValueChange={(env) => {
            const config = DocumentConfig.find(c => c.env === env) || null;
            setSelectedConfig(config)
          }}
        >
          <SelectTrigger className="w-full mt-1" id="environment">
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

        <Button
          size="sm"
          className="mt-2 w-full"
          onClick={() => {
            setIsAdding(true)
            setSelectedConfig(null)
          }}
        >
          + Add Environment
        </Button>

        <Button
          variant="destructive"
          disabled={!SelectedConfig || isAdding}
          size="sm"
          className="mt-2 w-full"
          onClick={() => {
            setIsAdding(false)
            DeleteDocumentExtractionTasksSetting(SelectedConfig!).then(async () => {
              toast.success(`Configuration deleted successfully.`);
              const updatedconfig = await DocumentExtractionTasksSetting();
              setDocumentConfig(updatedconfig);
              setSelectedConfig(null);
            }).catch((error) => {
              toast.error(`Failed to delete configuration. Error: ${error.message}`);
            });
          }}
        >
        - Delete Environment
        </Button>
        
      </div>

      {/* Right */}

      <div className="flex-1 space-y-2">
        <AppConfigForm
          row={SelectedConfig}
          isAddMode={isAdding}
          onSaveAction={handleSaveConfig}
          onAddCancelAction={() => { 
            setIsAdding(false)
            //setSelectedConfig(null)
          }}
        />
      </div>
    </div>
  );
}