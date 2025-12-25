"use client";

import SubmitForm from "./submitform"
import {ListExtraction} from "./listextraction"
import AppConfigPage from "./appconfig/appconfigpage"

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

export default function Page() {
return (
  <div className="w-full gap-6 m-6">
    <Tabs defaultValue="submitform" className="w-full">

      <TabsList className="w-full">

        <TabsTrigger value="submitform" className="w-full">
          Submit Document Extraction
        </TabsTrigger>
        <TabsTrigger value="listextraction" className="w-full">
          List Document Extraction
        </TabsTrigger>
        <TabsTrigger value="appconfig" className="w-full">
          App Config
        </TabsTrigger>

      </TabsList>

      <TabsContent value="submitform" className="w-full" >
        <SubmitForm />
      </TabsContent>

      <TabsContent value="listextraction" className="w-full" >
        <ListExtraction />
      </TabsContent>

      <TabsContent value="appconfig" className="w-full" >
        <AppConfigPage />
      </TabsContent>

    </Tabs>
  </div>
);
}
