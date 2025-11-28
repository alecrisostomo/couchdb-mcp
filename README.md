# CouchDB MCP Server

## Resumen

Servidor MCP que permite interactuar con CouchDB desde clientes compatibles (Cursor, Claude Desktop). Gestiona bases de datos, documentos y consultas Mango.

## Guía Rápida

0. **Clonar repositorio**
   ```bash
   git clone git@github.com:alecrisostomo/github-webhooks.git
   cd couchdb-mcp
   ```
   Esta será la ruta que usarás en las configuraciones de Cursor o Claude Desktop.

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno** (crear `.env`)
   ```
   COUCHDB_URL=http://localhost:5984
   COUCHDB_USER=admin
   COUCHDB_PASSWORD=password
   ```

3. **Compilar**
   ```bash
   npm run build
   ```

4. **Configurar cliente MCP**

   **Cursor:**
   - Settings > Tools & MCP > New MCP server
   - Agregar en `mcp.json`:
   ```json
   {
     "mcpServers": {
       "couchdb-mcp-server": {
         "command": "/ruta/al/proyecto/couchdb-mcp/build/main.js",
         "env": {
           "COUCHDB_URL": "http://usuario:password@localhost:5984"
         }
       }
     }
   }
   ```

   **Claude Desktop:**
   - Editar `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) o `%APPDATA%\Claude\claude_desktop_config.json` (Windows)
   - Agregar la misma configuración JSON

5. **Usar**
   - El cliente MCP invocará las herramientas automáticamente

## Funcionalidades

### Bases de Datos
- `createDatabase` - Crear base de datos
- `listDatabases` - Listar todas las bases de datos
- `deleteDatabase` - Eliminar base de datos

### Documentos
- `createDocument` - Crear/actualizar documento
- `getDocument` - Obtener documento

### Consultas Mango (CouchDB 3.x+)
- `createMangoIndex` - Crear índice Mango
- `deleteMangoIndex` - Eliminar índice Mango
- `listMangoIndexes` - Listar índices
- `findDocuments` - Consultar con query Mango
- `queryDocuments` - Consultar con parámetros simplificados

