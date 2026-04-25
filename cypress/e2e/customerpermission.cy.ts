describe("Customer Permission Page", () => {
  it("loads and switches tabs", () => {
    cy.visit("http://localhost:3000/tasks/customerpermission");
    // Page loaded
    cy.contains("Customer Security Group").should("be.visible");
    // Click the tab
    cy.contains("Customer Security Group").click();
    // Assert something inside that tab
    // 👇 Replace with real content from CustomerSecurityGroup component
    cy.contains("Customer Security Group").should("be.visible");
    //
    cy.contains("2,3,4,5,6,7,8").should("be.visible");
    cy.contains("button", "2,3,4,5,6,7,8").click();

    // Click the Client ID list button
    cy.contains("button", "2,3,4,5,6,7,8").click();

    // Step 1: Popover opens (don’t rely on table yet)
    cy.get("body").should("contain", "Loading...");

    // Step 2: Wait for data to load
    cy.contains("Client ID", { timeout: 10000 }).should("be.visible");

    // Then table data appears
    cy.contains("CYNamespace", { timeout: 10000 }).should("be.visible");

    // Validate key rows
    cy.contains("td", "2").should("be.visible");
    cy.contains("NonProdClientDb2").should("be.visible");

    cy.contains("WrongIpaddress").should("be.visible");

    // // Step 2: Open actions menu (first row)
    // cy.get('[data-testid="actions-button"]').first().click();

    // // Step 3: Click "Check DB Permission"
    // cy.get('[data-testid="check-db-permission"]').click();

    // // Step 4: Dialog should appear
    // cy.get('[data-testid="customer-dialog"]', { timeout: 10000 }).should("be.visible");

    // // Step 5: Table should load
    // cy.get('[data-testid="customer-table"]', { timeout: 10000 }).should("be.visible");

    // // Step 6: Validate key data (sample rows)

    // // Example: Client ID 2
    // cy.contains("td", "2").should("be.visible");
    // cy.contains("CYNamespace").should("be.visible");
    // cy.contains("NonProdClientDb2").should("be.visible");

    // // Example: Wrong IP case
    // cy.contains("WrongIpaddress").should("be.visible");

    // // Example: missing DB case (Client ID 3)
    // cy.contains("td", "3").should("be.visible");
  });
});
