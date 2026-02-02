# 🚀 Deploy Rápido na Render

## Passo 1: Fazer commit e push

```bash
git add .
git commit -m "Preparado para deploy na Render"
git push origin main
```

## Passo 2: Criar Web Service na Render

1. Acesse: https://dashboard.render.com
2. Clique em: **New +** → **Web Service**
3. Conecte seu repositório Git (GitHub, GitLab ou Bitbucket)
4. Configure conforme abaixo:

### Build & Deploy
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Environment
- **Region**: Oregon (ou sua preferência)
- **Branch**: `main`
- **Plan**: Free (ou pago para melhor performance)

### Environment Variables (obrigatórias)

```
NODE_ENV=production
PORT=3000
GOOGLE_SHEETS_API_KEY=AIzaSyClW8qW40WGipybiOGRWhFOblRUCekQWEI
NEXT_PUBLIC_GOOGLE_SHEETS_SPREADSHEET_ID=1-4Y3UBvVaq-vgtRkU9BcmiWmcoRMYdjBX5kdjmWB4
DATABASE_URL=file:./db/custom.db
```

### Disco Persistente (OBRIGATÓRIO!)

⚠️ **MUITO IMPORTANTE**: O disco persistente é necessário para manter os dados do banco entre deploys.

1. Role para baixo até **Advanced**
2. Clique em **Add Disk**
3. Configure:
   - **Name**: `data`
   - **Mount Path**: `/app/db`
   - **Size**: `1 GB` (ou mais conforme necessário)

## Passo 3: Deploy

Clique em **Create Web Service** e aguarde o build e o deploy.

## Passo 4: Primeiro Acesso

Após o deploy terminar:

1. Acesse a URL gerada (ex: https://urban-country-store.onrender.com)
2. Clique em **Sincronizar** no dashboard
3. Isso vai:
   - Criar o banco de dados
   - Importar dados da planilha do Google Sheets
   - Mostrar o dashboard com os dados

## ⚠️ Importante

- **Disco persistente** é OBRIGATÓRIO para manter dados entre deploys
- **Variáveis de ambiente** devem ser configuradas corretamente
- **DATABASE_URL** deve apontar para o disco persistente (`/app/db/custom.db`)
- **API Key** do Google Sheets deve estar válida

## 📚 Documentação Completa

Para mais detalhes, veja o arquivo **DEPLOY_RENDER.md**.
