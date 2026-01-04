# Guia de Implementação de Funções Individuais (Aegis Module)

Este documento serve como um roteiro técnico para substituir a lógica simulada (mock) por implementações reais. Ele detalha as funções específicas que devem ser desenvolvidas no backend ou no plugin "satélite" instalado no WordPress alvo.

---

## 1. Gestão e Integridade de Ativos (Aba Structure)

Estas funções lidam com a listagem e verificação de plugins e temas.

### `fetchInstalledAssets(targetUrl, credentials)`
**Objetivo:** Listar todos os plugins e temas instalados, independentemente do status.
**Lógica de Implementação:**
1.  Conectar via SSH ou WP REST API autenticada.
2.  Ler os diretórios `/wp-content/plugins/` e `/wp-content/themes/`.
3.  Ler os cabeçalhos dos arquivos principais (ex: `style.css` para temas, `plugin.php` para plugins) para extrair `Name`, `Version`, `Author`.
4.  Consultar o banco de dados (`wp_options` -> `active_plugins`) para determinar o status (`active` vs `inactive`).
5.  **Retorno:** Array de objetos `WpAsset`.

### `verifySingleAssetIntegrity(asset, credentials)`
**Objetivo:** Verificar se um ativo específico foi modificado (corrupção ou malware).
**Lógica de Implementação:**
1.  Identificar o `slug` e a `version` do ativo.
2.  Consultar a API do WordPress.org (`downloads.wordpress.org`) para baixar o hash MD5 original daquela versão específica.
    *   *Nota:* Para plugins premium/privados, comparar com um hash armazenado localmente ou pular verificação de checksum.
3.  Calcular o hash MD5 de todos os arquivos locais do plugin/tema.
4.  Comparar os hashes locais com os hashes oficiais.
5.  **Retorno:** Status (`clean`, `corrupted`, `malicious`) e lista de arquivos modificados.

### `verifyAllAssets(assetsList, credentials)`
**Objetivo:** Processamento em lote da função acima.
**Lógica de Implementação:**
1.  Implementar uma fila (Queue) assíncrona para não sobrecarregar o servidor alvo.
2.  Iterar sobre `assetsList` chamando `verifySingleAssetIntegrity`.
3.  Atualizar o estado da UI em tempo real conforme cada item é processado.

---

## 2. Protocolos de Conexão (Botão "Establish Connection")

Substituir o `setTimeout` por handshakes reais.

### `initiateHandshake(url, appPassword)`
**Objetivo:** Validar se o alvo é um site WP e se as credenciais básicas funcionam.
**Lógica:** Fazer uma chamada `GET /wp-json/wp/v2/users/me` usando Autenticação Básica.

### `validateDatabaseAccess(host, user, pass, dbName)`
**Objetivo:** Testar conexão MySQL direta.
**Lógica:** Tentar abrir uma conexão PDO/MySQLi. Executar `SELECT 1` ou verificar permissões de escrita.

### `establishSecureTunnel(sshConfig)`
**Objetivo:** Criar túnel para operações de sistema de arquivos.
**Lógica:** Tentar conexão SSH via chave privada ou senha. Validar permissões de escrita em `wp-config.php` e `.htaccess`.

---

## 3. Motores de Diagnóstico (Toolbar Scans)

Lógica específica para cada botão de scan.

### `scanSEOandAds(targetUrl)`
**Objetivo:** Verificar conformidade com Google Ads e SEO técnico.
**Lógica de Implementação:**
1.  **Request HTTP:** Fazer GET na home e páginas principais.
2.  **Meta Tags:** Verificar presença de `meta description`, `robots`, canonical.
3.  **Arquivos Especiais:**
    *   Verificar existência e conteúdo de `robots.txt`.
    *   Verificar existência e validade de `ads.txt` (buscar ID do publisher).
4.  **Performance/UX:** Medir TTFB (Time to First Byte) e verificar flags de "Landing Page Experience" (ex: excesso de popups, CLS alto).

### `scanMalwareSignatures(fileSystemPath)`
**Objetivo:** Buscar padrões de código malicioso conhecidos.
**Lógica de Implementação:**
1.  Escanear recursivamente arquivos `.php` e `.js`.
2.  Buscar padrões Regex comuns:
    *   `eval(base64_decode(`
    *   `gzinflate(base64_decode(`
    *   `\x65\x76\x61\x6c` (eval ofuscado)
    *   `document.write(unescape(`
3.  Verificar arquivos PHP dentro da pasta `/wp-content/uploads/` (onde não deveriam existir).

### `scanDatabaseHealth(dbConnection)`
**Objetivo:** Analisar integridade e performance do DB.
**Lógica de Implementação:**
1.  **Autoload Size:** `SELECT SUM(length(option_value)) FROM wp_options WHERE autoload = 'yes'`. Se > 1MB, alertar.
2.  **Orphaned Data:** Buscar meta dados sem post correspondente.
3.  **Injeção SQL:** Buscar padrões como `<script>` ou `IFRAME` dentro de `wp_posts` e `wp_comments`.

---

## 4. Remediação Autônoma (Botão "Apply Fixes")

Estas funções executam as correções geradas pela IA. Devem ser executadas com extrema cautela.

### `executeRemediationPlan(issuesList, credentials)`
**Objetivo:** Aplicar correções selecionadas.
**Lógica de Implementação:**
1.  **Backup Preventivo:** Antes de qualquer ação, disparar um dump do banco ou cópia do arquivo alvo.
2.  **Roteamento de Correção:**
    *   Se `layer == 'database'`: Executar a query SQL fornecida em `issue.fix`.
    *   Se `layer == 'filesystem'`:
        *   Se for remoção de malware: Remover o trecho de código ou o arquivo.
        *   Se for config: Reescrever o arquivo (ex: `.htaccess`) com a regra segura.
    *   Se `layer == 'seo_ads'`: Injetar cabeçalhos via `functions.php` ou editar `robots.txt`.
3.  **Verificação Pós-Fix:** Re-escanear o item específico para confirmar resolução.

---

## 5. Módulo Complementar (Web Tracking)

Conforme solicitado na descrição inicial.

### `injectTrackingModule(targetUrl)`
**Objetivo:** Inserir o script de rastreamento para proteção/análise de pessoas.
**Lógica:**
1.  Verificar se o plugin "Aegis Tracker" já existe.
2.  Se não, criar arquivo em `/wp-content/mu-plugins/aegis-tracker.php`.
3.  Injetar código PHP que adiciona o script JS de validação em tempo real no hook `wp_head`.
4.  O script JS deve conectar-se à API `validateContent` definida em `geminiService.ts`.
