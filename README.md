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
- Deploy (Vercel + Render/Railway)
- Configuração do Frontend para API (API_BASE dinâmica)
- Exemplos rápidos (PowerShell/curl)
- Troubleshooting (erros comuns)
- Personalização rápida (UI)
- Convenções de commit

---

## 🔎 Visão geral

O Relíquias é um catálogo de veículos com:
- Catálogo público com filtros por marca e cards padronizados (lazy-loading de imagens, clamp de descrição, grid responsiva).
- Página de detalhes em painel lateral com simulação simples de financiamento.
- Formulários públicos de contato e agendamento (salvos no MongoDB).
- Área administrativa com login (JWT) para CRUD de veículos, listagem de leads/agendamentos e atualização de status.
- Suporte a imagens de veículos por upload (convertidas para WebP e salvas no GridFS) e também por URL externa.

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
│   ├── catalog.js, card.js, sidepanel.js, favorites.js
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
- Favoritos (localStorage)
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
	cor?: String, km?: Number,
	imagens: [{ fileId?: String, url?: String, principal?: Boolean }],
	createdAt, updatedAt
}
```

### Lead
```js
{ nome: String!, email: String!, telefone?: String, mensagem?: String, origem: 'contato'|'veiculo'|'outro', timestamps }
```

### Agendamento
```js
{ nome: String!, email: String!, telefone?: String, veiculoId?: ObjectId, dataHora: Date!, status: 'pendente'|'confirmado'|'cancelado', timestamps }
```

---

## 🔌 API (referência)

Base: `http://localhost:4000/api` (dev) ou `https://SUA-API/api` (prod)

Autenticação
- POST `/auth/login` → `{ token, user }` (admin simulado)
	- Email: `admin@reliquias.com` | Senha: `admin123` (em produção, altere!)

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

Agendamentos
- POST `/agendamentos` → cria (público)
- GET `/agendamentos` (admin) → lista
- PATCH `/agendamentos/:id/status` (admin) → `{ status }`

Headers para rotas admin
- `Authorization: Bearer <token>`

---

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
curl -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@reliquias.com","senha":"admin123"}'
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
