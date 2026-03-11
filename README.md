# EHS Project (Node.js + XAMPP + HTML/CSS/JS)

Este projeto foi ajustado para rodar local com:

- **Backend**: Node.js + Express
- **Banco**: MySQL do **XAMPP**
- **Frontend**: **HTML/CSS/JavaScript** (arquivos estáticos em `public/`)

## Rodando local (Windows + XAMPP)

### 1) Suba o MySQL no XAMPP

- Abra o **XAMPP Control Panel**
- Inicie o serviço **MySQL**

### 2) Crie o banco

No phpMyAdmin (ou no client MySQL), crie o banco:

- **Nome sugerido**: `ehs_project`

O servidor cria automaticamente a tabela `users` ao iniciar.

### 3) Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz copiando o exemplo:

- copie `.env.example` para `.env`
- ajuste `DB_USER`, `DB_PASSWORD` e `DB_NAME` se necessário

### 4) Instale e rode

```bash
npm install
npm run dev
```

Acesse:

- `http://localhost:3000/` (home)
- `http://localhost:3000/signup` (cadastro)
- `http://localhost:3000/login` (login)

### API

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`

## Estrutura

- `server.js`: servidor Express + rotas de API
- `config/database.js`: config do MySQL (XAMPP)
- `public/`: HTML/CSS/JS servidos pelo Express
