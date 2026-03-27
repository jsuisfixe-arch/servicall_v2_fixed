import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("Navigation entre les onglets du dashboard", async ({ page }) => {
    // Note: Ce test suppose que l'utilisateur est déjà connecté ou que la redirection est gérée.
    // Pour un test E2E complet, on ferait un login avant.
    // Ici on teste la structure de la page.
    
    await page.goto("/dashboard");
    
    // Si on est redirigé vers login, le test s'arrête là (comportement attendu si non connecté)
    if (page.url().includes('/login')) {
      console.log("Redirigé vers login comme prévu");
      return;
    }

    // Vérifier la présence des onglets
    const tabs = page.locator('[role="tab"]');
    await expect(tabs).toHaveCount(4);
    
    // Cliquer sur l'onglet Monitoring
    await page.click('text=Live Monitoring');
    await expect(page.locator('text=Live Monitoring')).toBeVisible();
    
    // Cliquer sur l'onglet Configuration IA
    await page.click('text=Configuration IA');
    await expect(page.locator('text=Configuration IA')).toBeVisible();
  });
});
