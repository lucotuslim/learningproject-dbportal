"use client";
import Settings from "./settings/page"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

export default function Home() {
return (
  <div className="w-full gap-6 m-6">
    <Tabs defaultValue="settings" className="w-full">
      <TabsList className="w-full">

        <TabsTrigger value="settings" className="w-full">
            Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="settings" className="w-full" >
        <Settings />
      </TabsContent>

    </Tabs>
  </div>
);
}
