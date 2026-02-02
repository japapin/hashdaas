# Urban Country Store - Dashboard de Vendas

Dashboard de Business Intelligence para controle de vendas da Urban Country Store.

## 🚀 Deploy na Render

### Pré-requisitos

- Conta na Render (https://render.com)
- Repositório Git (GitHub, GitLab, ou Bitbucket)

### Passos para Deploy

1. **Fazer push do código para o repositório Git**
   ```bash
   git add .
   git commit -m "Preparando para deploy na Render"
   git push origin main
   ```

2. **Criar novo Web Service na Render**
   - Acesse https://dashboard.render.com
   - Clique em "New +" → "Web Service"
   - Conecte seu repositório Git

3. **Configurar o Web Service**
   
   **Build & Deploy:**
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   
   **Environment:**
   - Region: Oregon (ou região de sua preferência)
   - Branch: `main`
   - Plan: Free (ou plano pago para melhor performance)
   
   **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3000
   GOOGLE_SHEETS_API_KEY=AIzaSyClW8qW40WGipybiOGRWhFOblRUCekQWEI
   NEXT_PUBLIC_GOOGLE_SHEETS_SPREADSHEET_ID=1-4Y3UBvVaq-vgtRkU9BcmiWmcoRMYdjBX5kdjmWB4
   DATABASE_URL=file:./db/custom.db
   ```

4. **Configurar Disco Persistente**
   
   Para manter os dados do banco de dados entre deploys:
   - Role para baixo até "Advanced"
   - Clique em "Add Disk"
   - Name: `data`
   - Mount Path: `/app/db`
   - Size: 1 GB (ou mais conforme necessário)
   
   **Importante:** O disco persistente é NECESSÁRIO para que os dados do banco não sejam perdidos ao fazer novo deploy.

5. **Deployar**
   - Clique em "Create Web Service"
   - Aguarde o build e o deploy
   - A URL do site será gerada automaticamente (ex: https://urban-country-store.onrender.com)

## 📋 Configuração Adicional

### Variáveis de Ambiente

- `GOOGLE_SHEETS_API_KEY`: API Key para acessar a planilha do Google Sheets
- `NEXT_PUBLIC_GOOGLE_SHEETS_SPREADSHEET_ID`: ID da planilha do Google Sheets
- `DATABASE_URL`: URL do banco de dados SQLite
- `NODE_ENV`: Ambiente (production)
- `PORT`: Porta da aplicação (3000)

### Banco de Dados

O sistema usa SQLite com persistência em disco. O banco de dados fica em:
- `/app/db/custom.db` (em produção na Render)
- `./db/custom.db` (em desenvolvimento local)

## 🔄 Como Funciona

1. **Sincronização Automática**
   - Ao acessar o sistema, ele sincroniza automaticamente os dados da planilha do Google Sheets

2. **Dashboard em Tempo Real**
   - Mostra 4 cards de resumo (Faturamento, Custo, Lucro, Margem)
   - 4 gráficos interativos (Faturamento por Mês, Top 10 Produtos, Faturamento por Condição, Lucro por Produto)
   - Atualização em tempo real após sincronização

3. **Gerenciamento de Dados**
   - Botão "Sincronizar" para atualizar manualmente
   - Botão "Limpar Dados" para apagar todos os registros do banco
   - Upsert para evitar duplicatas (baseado em produto + data)

## 📊 Estrutura da Planilha

A planilha do Google Sheets deve ter a seguinte estrutura:

```
Produto    | Faturamento | Custo  | Lucro | Data       | Condição
-----------|-------------|--------|--------|------------|----------
Botas      | 200         | 100    | 100    | 29/01/2025 | Pix
Calça      | 300         | 150    | 150    | 29/01/2025 | Pix
Jaqueta    | 400         | 200    | 200    | 29/01/2025 | Pix
```

## 🛠️ Tecnologias

- **Framework**: Next.js 16 (App Router)
- **Linguagem**: TypeScript
- **Banco de Dados**: SQLite com Prisma ORM
- **Estilização**: Tailwind CSS 4 + shadcn/ui
- **Gráficos**: Recharts
- **API**: Google Sheets API

## 📝 Notas Importantes

- O disco persistente é obrigatório para manter os dados entre deploys
- O banco de dados SQLite está configurado para usar o disco persistente
- A API do Google Sheets usa API Key (configure corretamente no Render)
- O sistema faz sincronização automática ao acessar a página
- Para limpar dados, clique em "Limpar Dados" no dashboard

## 🔧 Troubleshooting

### Deploy falhou
- Verifique as variáveis de ambiente
- Verifique se o disco persistente está configurado
- Verifique os logs no painel da Render

### Dados não aparecem
- Verifique se a planilha do Google Sheets tem dados
- Clique em "Sincronizar" manualmente
- Verifique a API Key do Google Sheets

### Erro 500
- Verifique os logs no painel da Render
- Verifique se as variáveis de ambiente estão corretas
- Verifique se o banco de dados foi criado corretamente

## 📧 Suporte

Para suporte, verifique os logs no painel da Render ou entre em contato com o desenvolvedor.
