# Projeto ESO-Fortnite

Este é um projeto full-stack de um "Simulador de Loja de Cosméticos do Fortnite".

A aplicação permite que os usuários se registem, recebam uma quantia inicial de V-Bucks e simulem a compra e o reembolso de itens cosméticos do Fortnite. O backend sincroniza automaticamente com a API pública do `fortnite-api.com` para manter o banco de dados de cosméticos atualizado.

## ✨ Funcionalidades

* **Autenticação**: Sistema completo de registo e login de usuários.
* **Sincronização de API**: O backend possui um trabalho agendado que sincroniza e atualiza o banco de dados de cosméticos a partir da API externa do Fortnite.
* **Loja e Filtros**: Uma página principal que exibe todos os cosméticos, com um painel de filtros.
* **Simulação de Compra**: Os usuários podem comprar cosméticos, o que debita o valor em V-Bucks da sua conta e adiciona o item ao seu inventário.
* **Simulação de Reembolso**: Usuários podem reembolsar itens do seu inventário, recebendo os V-Bucks de volta.
* **Inventário Pessoal**: Página Meus Itens onde cada usuário pode ver os cosméticos que possui.
* **Histórico de Transações**: Página Histórico que lista todas as compras e reembolsos feitos pelo usuário.
* **Perfis Públicos**: Uma página "Usuários" que lista todos os usuários registados, permitindo clicar para ver o inventário público de cada um, por meio da rota de /users.
* **Containerização**: O backend é totalmente containerizado com Docker e Docker Compose para fácil configuração e deploy.

## 🚀 Tecnologias Utilizadas

Este projeto é dividido em duas partes principais:

### Backend
* **Node.js**
* **Express**: Framework para a API REST.
* **Prisma**: ORM para interação com o banco de dados PostgreSQL.
* **TypeScript**: Linguagem principal.
* **PostgreSQL**: Banco de dados relacional.
* **Docker**: Para containerização do backend e do banco de dados.

### Frontend
* **React**
* **Vite**: Ferramenta de build e servidor de desenvolvimento.
* **TypeScript**: Linguagem principal.
* **React Router DOM**: Para navegação e rotas da aplicação.
* **Axios**: Para realizar chamadas à API do backend.
* **CSS Modules**: Para estilização dos componentes.

## 📦 Como Executar o Projeto

Para executar este projeto localmente, irá precisar do **Node.js**, **NPM** (ou Yarn) e **Docker Desktop** instalados.

### 1. Configuração do Backend

O backend utiliza Docker Compose para orquestrar o servidor da aplicação e o banco de dados PostgreSQL.

1.  Navegue até à pasta `backend/`:
    ```bash
    cd backend
    ```

2.  Instale as dependências do Node:
    ```bash
    npm install
    ```

3.  Crie um ficheiro `.env` na raiz da pasta `backend/` com as seguintes variáveis:
    ```.env
    # URL de conexão interna do Docker (usada pelo Prisma)
    DATABASE_URL="postgresql://postgres:admin@db:5432/project-eso-fortnite"
    
    # Chave de API necessária para o serviço de sincronização
    # Obtenha a sua em [https://fortnite-api.com](https://fortnite-api.com)
    FORTNITE_API_KEY="SUA_API_KEY_AQUI"
    
    # Porta que o servidor backend irá escutar
    PORT=4000
    ```
    *(Nota: As variáveis `DATABASE_URL` e `PORT` baseiam-se no seu ficheiro `docker-compose.yml` e `syncFortniteApi.ts`)*

4.  Inicie os containers do Docker:
    ```bash
    docker-compose up --build
    ```

### 2. Configuração do Frontend

1.  Navegue até à pasta `frontend/`:
    ```bash
    cd frontend
    ```

2.  Onde tiver essa variável `${import.meta.env.VITE_API_URL}` troque por `http://localhost:4000` pois altualmente está configurado para rodar na vercel

3.  Instale as dependências do Node:
    ```bash
    npm install
    ```

4.  Inicie o servidor de desenvolvimento do Vite:
    ```bash
    npm run dev
    ```
    A aplicação frontend estará acessível em `http://localhost:5173` (ou outra porta indicada pelo Vite).

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo `LICENSE` para mais detalhes.