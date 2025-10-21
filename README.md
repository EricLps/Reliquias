<div align="center">

# 🚗 Relíquias — Catálogo de carros clássicos

Frontend estático + API Node/Express + MongoDB Atlas (imagens via GridFS e/ou URL). Autenticação JWT na área Admin, CORS robusto, processamento de imagens com Sharp e layout responsivo.

Deploy de referência (frontend): https://reliquias.vercel.app/

</div>

---

## 📚 Sumário

- Visão geral
- Stack e arquitetura
- Estrutura de pastas
- Recursos implementados (Público e Admin)
- Papéis e contas (user, admin, adminMaster)
- Fluxo Contato → Lead → Agendamento
- Modelos de dados (Mongoose)
- Referência de API (Auth, Users, Veículos, Leads, Agendamentos)
- Imagens (GridFS + Sharp) e Imagem por URL
- Segurança (JWT, Helmet, Rate Limit) e CORS
- Configuração e execução (dev)
- Deploy (Vercel + Render/Railway)
- Configuração do Frontend (API_BASE) e WhatsApp
- Exemplos rápidos (PowerShell/curl)
- Troubleshooting (erros comuns)
- Personalização rápida (UI)
- Convenções de commit

---

## 🔎 Visão geral

O Relíquias é um catálogo de veículos com:
- Catálogo público com filtros por marca e cards otimizados.
- Detalhe em painel lateral com simulação simples de financiamento e carrossel de fotos (setas translúcidas e modernas).
- Formulários públicos de contato e agendamento.
- Área administrativa com login (JWT) para CRUD de veículos, leads e agendamentos; filtros, toasts e navegação com foco.
- Suporte a imagens via upload (GridFS + Sharp) e via URL externa.

---

## 🗂️ Estrutura de pastas (resumo)

```
.
├── admin.html
├── index.html
├── login.html
├── css/
│   ├── style.css
│   ├── admin.css
│   └── admin-agenda.css
├── js/
│   ├── main.js, navbar.js, logo.js, footer.js
│   ├── catalog.js, card.js, sidepanel.js, details.js, gallery.js, sobre.js
│   ├── contact.js, config.js
│   └── admin/
│       ├── admin.js, adminNavbar.js, adminViews.js, ui.js
│       ├── leads.js, agendamentos.js, usuarios.js, produtos.js
└── server/
    ├── package.json
    └── src/
        ├── index.js
        ├── middleware/auth.js
        ├── models/ (Veiculo.js, Lead.js, Agendamento.js, User.js)
        └── routes/ (veiculos.routes.js, leads.routes.js, agendamentos.routes.js, users.routes.js, auth.routes.js)
```

---

## ✨ Recursos implementados

### Público
- Catálogo de veículos a partir da API
  - Lazy-loading, object-fit e clamp de descrição
  - CTA “Mais informações” abre o painel lateral
- Painel lateral (side panel)
  - Carrossel de fotos com setas translúcidas (clique abre em nova aba)
  - Simulador simples de financiamento
- Contato e Agendamento (POST público)

### Admin (JWT)
- Login único (`login.html`) com redirecionamento por papel
- CRUD de veículos (upload múltiplo, imagem principal, URL externas, remoção)
- Leads: filtro por status, ações (WhatsApp/Concluir/Excluir/Agendar Test-Drive) e “Ver Agendamento”
- Agendamentos: filtros (tipo/status/prioridade/período/vínculo), badges, confirmar/cancelar/editar/excluir, foco via hash
- Minha conta: dropdown com “Editar perfil” (PATCH /auth/me), “Alterar senha” (POST /auth/change-password) e “Sair”
- Usuários: lista/criação/alteração de papéis (adminMaster)

---

## 👥 Papéis e contas

- user: acesso público (sem Admin)
- admin: acesso ao Admin (Veículos/Leads/Agendamentos/Relatórios)
- adminMaster: tudo do admin + gestão de usuários e papéis

Importante: Contas administrativas são gerenciadas internamente. Não há credenciais públicas nem instruções de criação/promocão documentadas aqui.

---

## 🔄 Fluxo Contato → Lead → Agendamento

Público (`js/contact.js`)
- Envio do formulário cria sempre um Lead
- Se marcar test-drive com data/hora, cria também um Agendamento “pendente” com prioridade “amarelo” e `leadId` (vincula ao Lead)
- O backend atualiza `lead.agendamentoId` no mesmo momento

Admin → Leads (`js/admin/leads.js`)
- Filtro por status (Todos/Abertos/Concluídos)
- Ações: WhatsApp, Concluir, Excluir, Agendar Test-Drive
- Ao agendar, o Lead recebe `agendamentoId`, e aparece “Ver Agendamento”
- Suporte a foco via hash `#admin-agendamentos?focus=<AG_ID>`

Admin → Agendamentos (`js/admin/agendamentos.js`)
- Filtros: tipo, status, prioridade, período (7/30 dias) e “Vínculo” (Com/Sem Lead)
- Populate de `leadId` (nome/email/telefone)
- Badge “Lead” + link “Ver Lead” → navega com `#admin-leads?focus=<LEAD_ID>`
- Ações por linha: Confirmar/Cancelar (PATCH status), Editar (PATCH), Excluir (DELETE)

---

## 🧱 Modelos (Mongoose)

### Veiculo
```js
{
  marca: String!, modelo: String!, ano: Number!, preco: Number!,
  cor?: String, carroceria?: String, km?: Number,
  descricaoCurta?: String, descricao?: String,
  imagens: [{ fileId?: String, url?: String, principal?: Boolean }],
  createdAt, updatedAt
}
```

### Lead
```js
{
  nome: String!, email: String!, telefone?: String,
  mensagem?: String, origem: 'contato'|'veiculo'|'outro',
  interesseTestDrive?: Boolean,
  agendamentoId?: ObjectId,   // vínculo quando o agendamento nasce do Lead
  createdAt, updatedAt
}
```

### Agendamento
```js
{
  nome?: String, email?: String, telefone?: String,
  titulo?: String,
  tipo: 'test-drive'|'vistoria'|'evento'|'outro',
  prioridade: 'azul'|'amarelo'|'vermelho',
  notas?: String,
  veiculoId?: ObjectId,      // opcional
  leadId?: ObjectId,         // vínculo com Lead (populate)
  dataHora: Date!,
  status: 'pendente'|'confirmado'|'cancelado',
  origem: 'publico'|'admin',
  createdAt, updatedAt
}
```

### User
```js
{ nome: String!, email: String! (unique), senhaHash: String!, role: 'user'|'admin'|'adminMaster' }
```

---

## 🔌 API (referência)

Base: `http://localhost:4000/api` (dev) | `https://SUA-API/api` (prod)

### Auth
- POST `/auth/login` e `/auth/signin` → `{ token, user }`
- POST `/auth/change-password` (JWT) → { ok: true }
- PATCH `/auth/me` (JWT) → atualiza `nome` do usuário do banco

### Users (adminMaster)
- GET `/users` (admin|adminMaster)
- POST `/users` (adminMaster) → cria usuário (role padrão: user)
- PATCH `/users/:id/role` (adminMaster) → promover/demover papéis
  (Todas as operações acima são restritas à equipe autorizada.)

### Veículos
- GET `/veiculos` | GET `/veiculos/:id`
- POST `/veiculos` (JWT) — multipart (upload) e/ou `imagemUrl`/`imagensUrls`
- PUT `/veiculos/:id` (JWT) — multipart ou JSON (quando sem imagens)
- DELETE `/veiculos/:id` (JWT)

### Leads
- POST `/leads` (público)
- GET `/leads` (JWT)
- PATCH `/leads/:id` (JWT) — atualização geral (ex.: `agendamentoId`)
- PATCH `/leads/:id/status` (JWT) — `aberto|concluido`
- DELETE `/leads/:id` (JWT)

### Agendamentos
- POST `/agendamentos` (público) — aceita `leadId`, salva e reflete em `lead.agendamentoId`
- POST `/agendamentos/admin` (JWT) — cria com `origem='admin'` (pode vir de Lead)
- GET `/agendamentos` (JWT) — ordenado, com `populate('leadId','nome email telefone')`
- GET `/agendamentos/:id` (JWT)
- PATCH `/agendamentos/:id/status` (JWT)
- PATCH `/agendamentos/:id` (JWT) — edita campos permitidos (inclui `leadId`)
- DELETE `/agendamentos/:id` (JWT)

---

## 🖼️ Imagens — upload e URL

- Upload: Multer (memory) + Sharp → WebP (quality 80) até 1600x1600
- Storage: GridFS (`uploads.files`/`uploads.chunks`)
- URL: adicionar imagens externas (sem passar pelo GridFS)
- Limite: 20MB por arquivo

---

## 🔐 Segurança e CORS

- JWT nas rotas protegidas (`verifyToken`, `requireAdmin`/`requireAdminMaster`)
- Helmet + Rate Limit (120 req/min) + morgan
- CORS dinâmico (`src/index.js`):
  - Libera localhost/127.0.0.1 (dev), origens `null`/sem header, e `*.vercel.app`
  - Use `CORS_ORIGIN` (se necessário) para whitelists adicionais

---

## 🛠️ Configuração e execução (dev)

Pré-requisitos: Node.js 18+, MongoDB Atlas (ou local)

1) API
```powershell
cd server
npm install
copy .env.example .env   # crie e edite suas variáveis
npm run dev              # http://localhost:4000
```

2) Frontend (estático)
- Abra `index.html` com um servidor estático (Live Server, etc.)
- Ou:
```powershell
npx serve .
```

Exemplo de `.env` (servidor)
```
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/reliquias?retryWrites=true&w=majority
JWT_SECRET=<segredo forte>
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500,https://reliquias.vercel.app
```

---

## 🚀 Deploy

### Frontend (Vercel)
1. Conecte o repositório (projeto estático)
2. (Opcional) Forçar API explícita:
   - `<meta name="api-base" content="https://SUA-API/api">`
   - `<script>window.__API_BASE__='https://SUA-API/api'</script>`

### API (Render/Railway)
- Build: `npm install` | Start: `npm start`
- Env vars: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=8h`, `CORS_ORIGIN=https://reliquias.vercel.app,https://*.vercel.app`

Observação: Vercel serverless limita uploads (~5MB). Prefira host “sempre ligado” para processar imagens (Sharp).

---

## ⚙️ Frontend: API_BASE e WhatsApp

API base dinâmica (qualquer uma destas):
1. `window.__API_BASE__ = 'https://SUA-API/api'`
2. `<meta name="api-base" content="https://SUA-API/api">`
3. Fallback: `http://localhost:4000/api` (dev)

WhatsApp
- `window.__WHATSAPP_NUMBER__ = '5511999999999'` ou `<meta name="whatsapp-number" content="5511999999999">`
- `js/config.js` expõe `WHATSAPP_NUMBER` e `buildWhatsAppLink`
- Side Panel e Admin Leads usam esse número

Toasts e Navegação com Foco
- `js/admin/ui.js` → `showToast(msg, type, { link })`
- Links como `#admin-agendamentos?focus=<AG_ID>` ou `#admin-leads?focus=<LEAD_ID>` fazem scroll + destaque

---

## 🧪 Exemplos rápidos

Health
```powershell
curl http://localhost:4000/api/health
```

Login (JWT)
```powershell
curl -X POST http://localhost:4000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d '{"email":"<EMAIL>","senha":"<SENHA>"}'
```

Criar Lead + Agendamento público (resumido)
```powershell
curl -X POST http://localhost:4000/api/leads -H "Content-Type: application/json" ^
  -d '{"nome":"João","email":"joao@ex.com","interesseTestDrive":true}'
```

Abrir Agenda com foco
```
admin.html#admin-agendamentos?focus=<AG_ID>
```

---

## 🧯 Troubleshooting

1) “Not allowed by CORS”
- Confirme `CORS_ORIGIN` inclui seus domínios (Vercel) e ambientes locais.

2) Login falha em produção
- Verifique `API_BASE` no frontend; ajuste via `<meta>`/`window.__API_BASE__`.

3) Upload falha (413/Failed to fetch)
- Arquivo > 20MB? Reduza a imagem. Prefira host “sempre ligado”.

4) MongoDB não conecta
- Cheque `MONGODB_URI` e a IP Access List do Atlas.

5) Imagens não aparecem
- URL externa: verifique CORS/HTTPS da origem
- GridFS: confirme `fileId` e `/veiculos/imagem/:fileId`

---

## 🎨 Personalização rápida (UI)

- Altura da imagem no card: `css/style.css` → `.card-img { height: 160px; }`
- Largura do card: `.card-carro { max-width: 360px; }`
- Linhas de descrição: `.descricao { -webkit-line-clamp: 2; line-clamp: 2; }`

---

## 📝 Convenções de commit

Conventional Commits
- `feat: ...` novas funcionalidades
- `fix: ...` correções
- `chore: ...` manutenção/infra
- `refactor: ...` melhorias internas

Ex.: `feat: vínculo Lead↔Agenda e carrossel no Side Panel`

---

## ⚠️ Notas de segurança

- Não versione `server/.env` (use `server/.env.example`)
- Não publique segredos (JWT, senhas). Use variáveis de ambiente e contas reais (evite o admin “hardcoded” em produção)

---

Feito com ❤️ para acelerar seu catálogo de relíquias automotivas.
