"use client";
import React from "react";
//import MissingRoleMappings from "./missingrolemapping/page";
import CustomerSecurityGroup from "./customersecuritygroup/page"
import HCMCore from "./hcmcore/page"
import Settings from "./appconfig/appconfigpage"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function Page() {

  return (
    <div className="w-full gap-6 m-6">
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="w-full">

          {/* <TabsTrigger value="missingrolemappings" className="w-full">
            Missing Role Mappings
          </TabsTrigger> */}

          <TabsTrigger value="customersecuritygroup" className="w-full">
            Customer Security Group
          </TabsTrigger>
          <TabsTrigger value="hcmcore" className="w-full">
            HCM Core
          </TabsTrigger>
          <TabsTrigger value="settings" className="w-full">
            Settings
          </TabsTrigger>
        </TabsList>

        {/* <TabsContent value="missingrolemappings" className="w-full" >
          <MissingRoleMappings />
        </TabsContent> */}

        <TabsContent value="customersecuritygroup" className="w-full" >
          <CustomerSecurityGroup />
        </TabsContent>
        <TabsContent value="hcmcore" className="w-full" >
          <HCMCore />
        </TabsContent>
        <TabsContent value="settings" className="w-full" >
          <Settings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
