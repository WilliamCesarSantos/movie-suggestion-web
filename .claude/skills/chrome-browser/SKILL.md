---
name: chrome-browser
description: Como abrir e inspecionar o aplicativo no Chrome para validação manual. Use quando precisar navegar pela aplicação, verificar layout, interações ou simular uso real.
---

# Chrome Browser

Automação e inspeção da aplicação no Chrome para validação visual.

## Opções (em ordem de preferência)

### 1. Chrome DevTools MCP (se disponível)
Se o usuário tiver o MCP `chrome-devtools` configurado, use-o para:
- Navegar programaticamente.
- Capturar screenshots.
- Inspecionar DOM.
- Monitorar console/network.

### 2. Script Node com Puppeteer (fallback)
Instale como devDependency se necessário:
```bash
npm install -D puppeteer
```

Script `scripts/validate.mjs`:
```js
import puppeteer from "puppeteer";

const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1280, height: 800 } });
const page = await browser.newPage();

await page.goto("http://localhost:5173/login");
await page.screenshot({ path: "docs/screenshots/login.png" });

await page.type('input[name="email"]', process.env.USER_EMAIL);
await page.type('input[name="password"]', process.env.USER_PASSWORD);
await page.click('button[type="submit"]');

await page.waitForSelector('[data-testid="catalog-grid"]', { timeout: 10_000 });
await page.screenshot({ path: "docs/screenshots/catalog.png" });

// Scroll infinito
for (let i = 0; i < 3; i++) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((r) => setTimeout(r, 1500));
}
await page.screenshot({ path: "docs/screenshots/catalog-scrolled.png" });

await browser.close();
```

### 3. Abrir manualmente
Se a automação falhar, peça ao usuário para:
```bash
open -a "Google Chrome" http://localhost:5173
```
E descreva o que ele deve observar.

## Pré-requisitos
Antes de abrir o Chrome:
1. `npm run dev` precisa estar rodando em `http://localhost:5173`.
2. Backend em `http://localhost:8080` precisa responder `/api/v1/health`.
3. Credenciais de teste disponíveis em variáveis de ambiente (`USER_EMAIL`, `USER_PASSWORD`).

## O que inspecionar
Para cada tela validada:
- Layout corresponde ao wireframe em `docs/prototypes/`.
- Grid responsivo em larguras `375px`, `768px`, `1440px`.
- Scroll infinito dispara ao chegar perto do fim.
- Modal de reprodução abre com animação e sem elemento `<video>` real.
- Console sem erros ou warnings críticos.

## Screenshots
Salve em `docs/screenshots/` para posterior comparação com protótipo.
