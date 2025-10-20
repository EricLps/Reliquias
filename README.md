<div align="center">

# 🚗 Relíquias — Catálogo de carros clássicos

Frontend estático + API Node/Express + MongoDB Atlas (com imagens via GridFS e/ou URL). Autenticação JWT para área admin, CORS robusto, compressão de imagens com Sharp e layout responsivo com cards otimizados.

Deploy de referência (frontend): https://reliquias.vercel.app/

</div>

---

## 📚 Sumário

- Visão geral
- Stack e arquitetura
- Estrutura de pastas
- Recursos implementados (Frontend e Admin)
- Modelos de dados (Mongoose)
- Referência de API (endpoints)
- Upload de imagens (GridFS + Sharp) e Imagem por URL
- Segurança (JWT, Helmet, Rate Limit) e CORS
- Configuração e execução (dev)
- Deploy (Vercel + Render)
- Configuração do Frontend para API (API_BASE dinâmica)
- Configuração do WhatsApp (WHATSAPP_NUMBER)
- Exemplos rápidos (PowerShell/curl)
- Troubleshooting (erros comuns)
- Personalização rápida (UI)
- Convenções de commit

— Novidades recentes

---

## 🔎 Visão geral

O Relíquias é um catálogo de veículos com:
- Catálogo público com filtros por marca e cards padronizados (lazy-loading de imagens, clamp de descrição, grid responsiva).
- Página de detalhes em painel lateral com simulação simples de financiamento.
- Formulários públicos de contato e agendamento (salvos no MongoDB).
- Área administrativa com login (JWT) para CRUD de veículos, listagem de leads/agendamentos e atualização de status.
- Suporte a imagens de veículos por upload (convertidas para WebP e salvas no GridFS) e também por URL externa.

Novidades recentes
- Página Sobre reestruturada (parallax adicional, métrica, cards, timeline e CTA final).
- Catálogo: fallback na home — se nenhum veículo estiver marcado como “destaque”, a home exibe todos os veículos até que um filtro seja aplicado.
- Contato → Lead → Agendamento: envio do formulário de contato sempre cria um Lead; se marcar test-drive com data/hora, cria também um Agendamento “pendente”.
- Admin Leads: coluna “Interesse” + botão WhatsApp com mensagem padrão incluindo nome e motivo do contato.
- Admin Leads: filtro por status (Todos/Abertos/Concluídos), coluna “Status” separada, ações de Concluir/Excluir, criar Agendamento de Test-Drive a partir do lead e botão “Ver Agendamento” quando houver vínculo; toasts de sucesso/erro e toast clicável para abrir a Agenda.
- Admin Agendamentos: layout dedicado, filtros (tipo/status/prioridade/período), ações com botões icônicos (confirmar/cancelar/editar/excluir), badges de status, exclusão (DELETE) e CSS isolado em `css/admin-agenda.css`.

---

## 🧩 Stack e arquitetura

- Frontend: HTML + CSS + JavaScript (ES modules)
	- Navegação por hash, componentes modulares (`js/`)
	- Config dinâmico da API (`js/config.js`)
- Backend: Node.js + Express
	- Mongoose (MongoDB Atlas)
	- Multer (memory) + Sharp + GridFS para imagens
	- Helmet, CORS, morgan, express-rate-limit
	- Autenticação JWT para rotas admin

---

## 🗂️ Estrutura de pastas

```
.
├── admin.html
├── index.html
├── login.html
├── css/
│   ├── style.css
│   └── admin.css
├── js/
│   ├── config.js              # resolve API_BASE dinamicamente
│   ├── main.js, navbar.js, footer.js, logo.js
│   ├── catalog.js, card.js, sidepanel.js
│   ├── contact.js, details.js, gallery.js, sobre.js
│   ├── auth.js, login.js
│   └── admin/
│       ├── admin.js, adminViews.js, adminNavbar.js
│       ├── produtos.js (legado/auxiliar)
│       ├── leads.js, agendamentos.js
│       └── navigation.js (se aplicável)
└── server/
		├── package.json (start/dev)
		├── .env.example (variáveis de exemplo)
		└── src/
				├── index.js (boot do Express + CORS + Mongo)
				├── middleware/auth.js (JWT)
				├── models/
				│   ├── Veiculo.js
				│   ├── Lead.js
				│   └── Agendamento.js
				└── routes/
						├── auth.routes.js
						├── veiculos.routes.js
						├── leads.routes.js
						└── agendamentos.routes.js
```

---

## ✨ Recursos implementados

### Público
- Catálogo de veículos a partir da API (sem mock)
- Filtro por marca (dinâmico)
- Cards com:
	- Imagem com lazy-loading, tamanho fixo e object-fit
	- Marca, modelo, ano, preço (pt-BR)
	- Descrição com 2 linhas (clamp)
	- CTA “Mais informações” abre painel lateral
- Painel lateral (detalhe) com imagem principal (URL ou GridFS) e simulação de financiamento
- Contato e Agendamento (POST público para a API)

### Admin (JWT)
- Login e guarda de sessão/token
- CRUD de veículos (create/list/read/update/delete)
	- Upload de múltiplas imagens (até 20MB cada) com compressão via Sharp (WebP)
	- Imagens por URL (adicional ou alternativa ao upload)
	- Marcar/alterar imagem principal e remover imagens
- Leads: listagem (protegida)
- Agendamentos: listagem e atualização de status (PATCH protegido)

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
	nome: String!,
	email: String!,
	telefone?: String,
	mensagem?: String,
	origem: 'contato'|'veiculo'|'outro',
	interesseTestDrive?: Boolean,  
	dataHora?: Date,                 // quando for indicado no contato
	agendamentoId?: ObjectId,        // vínculo quando o agendamento é criado a partir do Lead
	createdAt, updatedAt
}
```

### Agendamento
```js
{
	nome: String!,
	email: String!,
	telefone?: String,
	titulo?: String,
	tipo?: 'test-drive'|'vistoria'|'evento'|'outro',
	prioridade?: 'azul'|'amarelo'|'vermelho',
	veiculoId?: ObjectId,
	dataHora: Date!,
	status: 'pendente'|'confirmado'|'cancelado',
	origem: 'publico'|'admin',
	createdAt, updatedAt
}
```

---

## 🔌 API (referência)

Base: `http://localhost:4000/api` (dev) ou `https://SUA-API/api` (prod)

Autenticação
- POST `/auth/login` → `{ token, user }` (admin simulado)
	- Defina as credenciais de admin no seu ambiente e não publique usuários/senhas em documentação.

Veículos
- GET `/veiculos` → lista
- GET `/veiculos/:id` → item
- POST `/veiculos` (admin, multipart) → cria
- PUT `/veiculos/:id` (admin, multipart/JSON) → atualiza
- DELETE `/veiculos/:id` (admin) → apaga
- GET `/veiculos/imagem/:fileId` → serve imagem do GridFS (image/webp)

Leads
- POST `/leads` → cria (público)
- GET `/leads` (admin) → lista
- PATCH `/leads/:id` (admin) → atualiza campos do lead (ex.: agendamentoId, status, mensagem)

Agendamentos
- POST `/agendamentos` → cria (público)
- GET `/agendamentos` (admin) → lista
- PATCH `/agendamentos/:id/status` (admin) → `{ status }`
- PATCH `/agendamentos/:id` (admin) → editar dados do agendamento
- DELETE `/agendamentos/:id` (admin) → remover agendamento

Headers para rotas admin
- `Authorization: Bearer <token>`

---

## 🧭 Fluxos funcionais

### Contato → Lead → (opcional) Agendamento
Frontend (`js/contact.js`)
- O envio do formulário sempre faz POST em `/leads` com: nome, email, telefone, mensagem, origem='contato', `interesseTestDrive` (true/false) e `dataHora` (se fornecida).
- Se o usuário marcar “Quero agendar um test-drive” e fornecer data/hora, além do Lead é criado um Agendamento público em `/agendamentos` com `status='pendente'` e `tipo='test-drive'`.

Admin → Leads (`js/admin/leads.js`, `js/admin/adminViews.js`)
- A tabela de leads exibe colunas Nome, Email, Telefone, Mensagem, Interesse, Ações.
- Em “Interesse”, aparece uma badge “Contato” ou “Test-drive • data/hora”. É possível filtrar por status (Todos/Abertos/Concluídos).
- Em “Ações”, tem:
	- “WhatsApp” com link pré-preenchido,
	- “✓” Concluir contato (status=concluido),
	- “🗑️” Excluir contato,
	- “🗓️” Agendar Test-Drive (quando houver interesse); ao criar, o `agendamentoId` é salvo no Lead,
	- “Ver Agendamento” aparece quando o `agendamentoId` está presente.
	- primeiro nome do cliente (se disponível),
	- motivo do contato (test-drive em data/hora, ou a mensagem enviada, truncada a 140 chars),
	- usando `buildWhatsAppLink`.

Admin → Agendamentos (`js/admin/agendamentos.js`, `css/admin-agenda.css`)
- Filtros: tipo, status, prioridade e período (7/30 dias).
- Formulário compacto para adicionar agendamentos manuais (origem `admin`).
- Tabela com status em badges e ações por linha:
	- Confirmar/Cancelar (PATCH status),
	- Editar (PATCH dados),
	- Excluir (DELETE),
	- Ícones com tooltips e acessibilidade.
- Layout responsivo e estilos isolados em `css/admin-agenda.css` para não interferir em outras telas.

### Catálogo — fallback de destaque
- Na home, se não houver veículos marcados com `destaque`, o catálogo renderiza todos os veículos inicialmente para evitar tela vazia.

### Página “Sobre”
- Seções parallax (hero, citação e CTA), métrica, cards (Missão/Valores/Diferenciais/Compromisso) e timeline.
- Estilos em `css/style.css` com imagens substituíveis via `background-image` (URLs de exemplo do Unsplash). Basta trocar pelas suas imagens.

## 🖼️ Imagens — upload e URL

- Upload: Multer (em memória) + Sharp converte para WebP (quality 80) e redimensiona para até 1600x1600.
- Armazenamento: GridFS (`uploads.files`/`uploads.chunks`)
- URL: é possível adicionar imagens por URL (não passam pelo GridFS). A principal pode ser `fileId` (GridFS) ou `url`.
- Limite de tamanho (upload): 20MB por arquivo.

---

## 🔐 Segurança e CORS

- JWT nas rotas admin (middleware `verifyToken` e `requireAdmin`)
- Helmet + Rate Limit (120 req/min) + morgan (logs)
- CORS flexível (`server/src/index.js`):
	- Localhost/127.0.0.1 em qualquer porta (dev)
	- Origens sem header (curl/file) e `null`
	- Domínios `*.vercel.app` e domínio `https://reliquias.vercel.app`

Env vars (produção, sem versionar `.env`)
- Render/Railway (API): defina `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN` nas Settings do serviço.
- Vercel (frontend): não precisa de segredos; se quiser forçar API, use `<meta name="api-base">` ou `window.__API_BASE__`.
- Git: 
  - `.gitignore` ignora `.env` (raiz e subpastas) e há `server/.env.example` como referência.
  - Se um `.env` foi commitado por engano, remova do tracking e considere limpar o histórico (BFG/filter-repo) e ROTACIONAR segredos.

---

## 🛠️ Configuração e execução (dev)

Pré-requisitos
- Node.js 18+
- Conta/cluster MongoDB Atlas (ou Mongo local)

1) API
```powershell
cd server
npm install
copy .env.example .env   # crie e edite suas variáveis
npm run dev               # inicia em http://localhost:4000
```

2) Frontend (estático)
- Abra `index.html` via um servidor estático (ex.: Live Server no VS Code)
- Ou:
```powershell
npx serve .
```

Variáveis (.env do servidor)
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
1. Conecte o repositório no Vercel (projeto estático)
2. Opcional (definir API pública):
	 - Meta tag no `index.html`:
		 ```html
		 <meta name="api-base" content="https://SUA-API/api">
		 ```
	 - ou inline antes dos scripts:
		 ```html
		 <script>window.__API_BASE__ = 'https://SUA-API/api'</script>
		 ```
	 - ou no navegador (teste):
		 ```js
		 localStorage.setItem('API_BASE', 'https://SUA-API/api')
		 ```

### API (Render/Railway) — recomendado
1. Novo Web Service → selecione a pasta `server`
2. Build: `npm install` | Start: `npm start`
3. Env vars: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=8h`, `CORS_ORIGIN=https://reliquias.vercel.app,https://*.vercel.app`
4. Depois do deploy, use a URL do serviço como API_BASE (ex.: `https://reliquias-api.onrender.com/api`)

> Observação: a Vercel para serverless tem limite de upload (~5MB por request), por isso preferimos um host “sempre ligado” para a API que processa imagens (Sharp). 

---

## 🔁 API_BASE dinâmica no Frontend

`js/config.js` resolve a base da API em ordem:
1. `window.__API_BASE__`
2. `localStorage['API_BASE']`
3. `<meta name="api-base">`
4. Fallback: `http://localhost:4000/api` (dev) ou `/api` (prod)

---

## 💬 WhatsApp no Frontend (Agendar Test-Drive)

O botão “Agendar Test-Drive” do painel lateral abre o WhatsApp da concessionária com mensagem pré-preenchida.

Número do WhatsApp (configuração no frontend):
1. Janela (inline):
	```html
	<script>window.__WHATSAPP_NUMBER__ = '99999999'</script>
	```
2. Meta tag:
	```html
	<meta name="whatsapp-number" content="99999999" />
	```
3. localStorage (no console do navegador):
	```js
	localStorage.setItem('WHATSAPP_NUMBER', '99999999')
	```

Formato: apenas dígitos com DDI (ex.: 55 + DDD + número). Ex.: 5511999999999. Usei 99999999 aqui apenas como exemplo.

Implementação:
- `js/config.js`: `WHATSAPP_NUMBER` e `buildWhatsAppLink(message, number?)`
- `js/sidepanel.js`: usa `buildWhatsAppLink` no botão “Agendar Test-Drive” e no link “Falar no WhatsApp”.
- Admin Leads (`js/admin/leads.js`): usa `buildWhatsAppLink` para contatar o cliente que enviou o formulário de contato, com mensagem padrão contendo nome e motivo.

### Toasts no Admin e Navegação com Foco
- Utilitário: `js/admin/ui.js` → `showToast(message, type='info', options?)`.
- Tipos de toast: `success`, `error`, `info`.
- Navegação pelo toast: passe `options.link` (ex.: `#admin-agendamentos?focus=<id>`). A Agenda, ao abrir com esse hash, faz scroll até a linha com aquele id e destaca por ~2 segundos.

---

## 🧪 Exemplos rápidos

Health
```powershell
curl http://localhost:4000/api/health
```

Listar veículos
```powershell
curl http://localhost:4000/api/veiculos
```

Login admin (JWT)
```powershell
curl -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"email":"<ADMIN_EMAIL>","senha":"<ADMIN_SENHA>"}'
```

Atualizar Lead (vincular agendamento criado)
```powershell
curl -X PATCH http://localhost:4000/api/leads/<LEAD_ID> ^
	-H "Authorization: Bearer <TOKEN>" ^
	-H "Content-Type: application/json" ^
	-d '{"agendamentoId":"<AG_ID>"}'
```

Abrir Agenda com foco (via hash na URL do Admin)
```
admin.html#admin-agendamentos?focus=<AG_ID>
```

Criar veículo (URL de imagem)
```powershell
curl -X POST http://localhost:4000/api/veiculos ^
	-H "Authorization: Bearer <TOKEN>" ^
	-F marca=Toyota -F modelo=Corolla -F ano=2017 -F preco=100000 ^
	-F imagemUrl=https://exemplo.com/foto.jpg
```

---

## 🧯 Troubleshooting

1) “Not allowed by CORS”
- Confirme `CORS_ORIGIN` inclui seu domínio (Vercel) e ambientes locais.

2) Login falha em produção
- Verifique se o frontend está apontando para a API correta (API_BASE dinâmica).
- Rode no console do site: `localStorage.setItem('API_BASE','https://SUA-API/api')`

3) Upload falha (413/Failed to fetch)
- Tamanho > 20MB? Reduza a imagem. Render/Railway funcionam; Vercel serverless bloqueia uploads grandes.

4) MongoDB não conecta
- Verifique `MONGODB_URI` e IP Access List no Atlas. O log do serviço indicará “MongoDB conectado”.

5) Imagem não aparece
- Se a imagem é por URL: verifique se a URL é acessível publicamente (CORS da origem e HTTPS).
- Se é por GridFS: verifique o `fileId` e o endpoint `/veiculos/imagem/:fileId`.

---

## 🎨 Personalização rápida (UI)

- Altura da imagem no card: `css/style.css` → `.card-img { height: 160px; }`
- Largura do card: `.card-carro { max-width: 360px; }`
- Linhas de descrição: `.descricao { line-clamp: 2; -webkit-line-clamp: 2; }`

---

## 📝 Convenções de commit

Recomendado: Conventional Commits
- `feat: ...` novas funcionalidades
- `fix: ...` correções
- `chore: ...` manutenção/infra
- `refactor: ...` melhorias internas

Sugestão recente:
> `feat: cards padronizados, imagem por URL e CORS Vercel`

---

## ⚠️ Notas de segurança

- Não versione `server/.env` (já no `.gitignore`). Use `server/.env.example` como referência.
- Troque as credenciais de admin simuladas por um mecanismo real (ou mova usuário/senha para variáveis de ambiente e/ou banco).

---

Feito com ❤️ para acelerar seu catálogo de relíquias automotivas.
