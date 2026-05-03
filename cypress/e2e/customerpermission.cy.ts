// describe("Customer Permission", () => {
//   it("loads and get customer security group", () => {
//     cy.visit("/tasks/customerpermission");
//     // Page loaded
//     cy.contains("Customer Security Group").should("be.visible");
//     // Click the tab
//     cy.contains("Customer Security Group").click();
//     // Wait for Client ID button to be ready, then click
//     cy.contains("button", "2,3,4,5,6,7,8").should("be.visible").and("not.be.disabled").click();
//     // Wait for table header (means data loaded)
//     cy.contains("Client ID", { timeout: 10000 }).should("be.visible");
//     // Validate data
//     cy.get('[data-testid="client-popover"]').within(() => {
//       const expectedRows = [
//         ["2", "CYNamespace", "NonProdClientDb2", "192.168.100.121", "Yes"],
//         ["4", "CYNamespace", "NonProdClientDb4", "WrongIpaddress", "Yes"],
//         ["5", "WrongNamespace", "NonProdClientDb5", "192.168.100.121", "Yes"],
//         ["6", "CYNamespace", "NonProdClientDb6", "192.168.100.121", "Yes"],
//         ["7", "CYNamespace", "NonProdClientDb7", "192.168.100.121", "Yes"],
//         ["8", "CYNamespace", "NonProdClientDb8", "192.168.100.121", "Yes"],
//         ["3", "CYNamespace", "", "", "No"],
//       ];
//       cy.get("tbody tr").should("have.length", expectedRows.length);
//       cy.get("tbody tr").each(($row, rowIndex) => {
//         cy.wrap($row)
//           .find("td")
//           .then(($cells) => {
//             const expected = expectedRows[rowIndex];
//             expected.forEach((value, colIndex) => {
//               if (value !== "") {
//                 expect($cells.eq(colIndex)).to.contain(value);
//               }
//             });
//           });
//       });
//     });
//   });
// });

describe("ActionsCell", () => {
  it("opens dialog and loads DB permissions", () => {
    cy.visit("/tasks/customerpermission");
    cy.contains("Customer Security Group").should("be.visible");
    cy.contains("Customer Security Group").click();
    // Wait for the button to not be disabled and be visible
    // cy.get('[data-testid="actions-button"]').first().scrollIntoView().should("be.visible").click();
    cy.get('[data-testid="actions-button"]').first().click();
    // Check if the menu exists in the DOM at all (even if hidden)
    cy.get('[data-testid="check-db-permission"]').should("be.visible").click();

    const expectedRows = [
      {
        clientId: "2",
        namespace: "CYNamespace",
        database: "NonProdClientDb2",
        server: "192.168.100.121",
        permissionrequired: "db_owner",
        serverPrincipal: "Yes",
        databasePrincipal: "Yes",
        error: "",
      },
      {
        clientId: "4",
        namespace: "CYNamespace",
        database: "NonProdClientDb4",
        server: "WrongIpaddress",
        permissionrequired: "db_owner",
        error: " ServerPrincipalApi failed: Query timeout (child killed) after 5000 ms (DB_ERROR)",
      },
      {
        clientId: "5",
        namespace: "WrongNamespace",
        database: "NonProdClientDb5",
        server: "192.168.100.121",
        permissionrequired: "db_owner",
        serverPrincipal: "Yes",
        databasePrincipal: "No",
        remarks: "No Database Principal Found",
        missingdbmapping: "db_owner",
      },
      {
        clientId: "6",
        namespace: "CYNamespace",
        database: "NonProdClientDb6",
        server: "192.168.100.121",
        permissionrequired: "db_owner",
        serverPrincipal: "Yes",
        databasePrincipal: "No",
        remarks: "No Database Principal Found",
        missingdbmapping: "db_owner",
      },
      {
        clientId: "7",
        namespace: "CYNamespace",
        database: "NonProdClientDb7",
        server: "192.168.100.121",
        permissionrequired: "db_owner",
        serverPrincipal: "Yes",
        databasePrincipal: "No",
        remarks: "No Database Principal Found",
        missingdbmapping: "db_owner",
      },
      {
        clientId: "8",
        namespace: "CYNamespace",
        database: "NonProdClientDb8",
        server: "192.168.100.121",
        permissionrequired: "db_owner",
        serverPrincipal: "Yes",
        databasePrincipal: "Yes",
        remarks: `Missing Db Role Mappings :    db_owner`,
        missingdbmapping: "db_owner",
      },
    ];

    cy.get('[data-testid="customer-table"] tbody tr').should(
      "have.length.at.least",
      expectedRows.length
    );

    expectedRows.forEach((expected, index) => {
      cy.get('[data-testid="customer-table"] tbody tr')
        .eq(index)
        .within(() => {
          cy.get("td").eq(0).should("have.text", expected.clientId);
          cy.get("td").eq(1).should("have.text", expected.namespace);
          cy.get("td").eq(2).should("have.text", expected.database);
          cy.get("td").eq(3).should("have.text", expected.server);
          cy.get("td").eq(4).should("have.text", expected.permissionrequired);

          if (expected.serverPrincipal) {
            cy.get("td").eq(6).should("contain", expected.serverPrincipal);
          }

          if (expected.databasePrincipal) {
            cy.get("td").eq(7).should("contain", expected.databasePrincipal);
          }
          const remarksCell = cy.get("td").eq(8);

          if (expected.error) {
            // ❗ When error exists, your JSX does NOT render remarks
            remarksCell
              .should("not.contain", "No Database Principal Found")
              .and("not.contain", "Missing Db Role Mappings");
          } else if (expected.remarks === "No Database Principal Found") {
            remarksCell.should("contain", "No Database Principal Found");
          } else if (expected.remarks?.includes("Missing Db Role Mappings")) {
            remarksCell.within(() => {
              cy.contains("Missing Db Role Mappings").should("exist");
            });
          } else {
            remarksCell.should(($td) => {
              expect($td.text().trim()).to.equal("");
            });
          }
          if (expected.missingdbmapping) {
            cy.get("li").should("contain", expected.missingdbmapping);
          }
          if (expected.error) {
            cy.get("td").eq(9).should("contain", expected.error);
          }
        });
    });
  });
});
