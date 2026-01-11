"use client";
import React from "react";
// import AppConfigPage from "./appconfig/appconfigpage"
import CustomerSecurityGroup from "./customersecuritygroup/page"
import ConnectionString from "./monolilthconnectionstring/page"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function Page() {

  return (
    <div className="w-full gap-6 m-6">
      <Tabs defaultValue="customersecuritygroup" className="w-full">

        <TabsList className="w-full">

          <TabsTrigger value="customersecuritygroup" className="w-full">
            Customer Security Group
          </TabsTrigger>

          <TabsTrigger value="connectionstring" className="w-full">
            Connection String
          </TabsTrigger>

        </TabsList>

        <TabsContent value="customersecuritygroup" className="w-full" >
          <CustomerSecurityGroup />
        </TabsContent>


        <TabsContent value="connectionstring" className="w-full" >
          <ConnectionString />
        </TabsContent>

      </Tabs>
    </div>
  );
}
