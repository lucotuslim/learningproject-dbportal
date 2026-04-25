describe("Customer Permission Page", () => {
  it("loads and get connection string", () => {
    cy.visit("/tasks/customerpermission");
    // Page loaded
    cy.contains("Customer Security Group").should("be.visible");
    // Click the tab
    cy.contains("Customer Security Group").click();
    // Wait for Client ID button to be ready, then click
    cy.contains("button", "2,3,4,5,6,7,8").should("be.visible").and("not.be.disabled").click();
    // Wait for table header (means data loaded)
    cy.contains("Client ID", { timeout: 10000 }).should("be.visible");
    // Validate data
    cy.get('[data-testid="client-popover"]').within(() => {
      const expectedRows = [
        ["2", "CYNamespace", "NonProdClientDb2", "192.168.100.121", "Yes"],
        ["4", "CYNamespace", "NonProdClientDb4", "WrongIpaddress", "Yes"],
        ["5", "WrongNamespace", "NonProdClientDb5", "192.168.100.121", "Yes"],
        ["6", "CYNamespace", "NonProdClientDb6", "192.168.100.121", "Yes"],
        ["7", "CYNamespace", "NonProdClientDb7", "192.168.100.121", "Yes"],
        ["8", "CYNamespace", "NonProdClientDb8", "192.168.100.121", "Yes"],
        ["3", "CYNamespace", "", "", "No"],
      ];
      cy.get("tbody tr").should("have.length", expectedRows.length);
      cy.get("tbody tr").each(($row, rowIndex) => {
        cy.wrap($row)
          .find("td")
          .then(($cells) => {
            const expected = expectedRows[rowIndex];
            expected.forEach((value, colIndex) => {
              if (value !== "") {
                expect($cells.eq(colIndex)).to.contain(value);
              }
            });
          });
      });
    });
  });
});
