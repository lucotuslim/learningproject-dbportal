"use client";
import React from "react";
import MissingRoleMappings from "./missingrolemapping/page";
import CustomerSecurityGroup from "./customersecuritygroup/page"
import ConnectionString from "./monolilthconnectionstring/page"
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
          <TabsTrigger value="connectionstring" className="w-full">
            Connection String
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
        <TabsContent value="connectionstring" className="w-full" >
          <ConnectionString />
        </TabsContent>
        <TabsContent value="settings" className="w-full" >
          <Settings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
