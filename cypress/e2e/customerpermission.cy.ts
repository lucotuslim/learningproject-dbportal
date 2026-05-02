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
    cy.get('[data-testid="actions-button"]').first().realClick();
    // Check if the menu exists in the DOM at all (even if hidden)
    cy.get('[data-testid="check-db-permission"]').should("be.visible").click();

    const expectedRows = [
      {
        clientId: "2",
        namespace: "CYNamespace",
        database: "NonProdClientDb2",
        server: "192.168.100.121",
        serverPrincipal: "Yes",
        databasePrincipal: "Yes",
        error: "",
      },
      {
        clientId: "4",
        namespace: "CYNamespace",
        database: "NonProdClientDb4",
        server: "WrongIpaddress",
        error: "DB_ERROR",
      },
      {
        clientId: "5",
        namespace: "WrongNamespace",
        database: "NonProdClientDb5",
        server: "192.168.100.121",
        serverPrincipal: "Yes",
        databasePrincipal: "No",
        remarks: "No Database Principal Found",
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

          if (expected.serverPrincipal) {
            cy.get("td").eq(6).should("contain", expected.serverPrincipal);
          }

          if (expected.databasePrincipal) {
            cy.get("td").eq(7).should("contain", expected.databasePrincipal);
          }

          if (expected.remarks) {
            cy.get("td").eq(8).should("contain", expected.remarks);
          }

          if (expected.error) {
            cy.get("td").eq(9).should("contain", expected.error);
          }
        });
    });
  });
});
