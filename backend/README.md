# Orbit Track - Backend

This is a GraphQL API powered by [Fastify](https://www.fastify.io/) designed to provide data on trending pools, user management, and favorite token functionality. Below, you'll find all the details you need to get started with installation, configuration, usage, and further development of this service.

---

## Project Overview

This backend is a **GraphQL API** built with **Fastify**, providing:

- **Trending Pools**: Retrieves data on trending pools or tokens.
- **User Management**: Allows users to be created and managed within the database.
- **Favorite Token Functionality**: Users can add or remove tokens from their favorites.

Key files to look at:

- [`app.js`](./app.js): Main entry point that sets up the Fastify server, integrates Mercurius for GraphQL, and configures routes/resolvers.
- [`package.json`](./package.json): Lists all dependencies and scripts.
- [`database_migration.sql`](./database_migration.sql): Contains SQL statements to create tables, indices, and manage database schema.
- [`Dockerfile`](./Dockerfile): Provides instructions for building a Docker image.

---

## Prerequisites

Ensure you have the following installed before proceeding:

- **[Node.js](https://nodejs.org/)** (the required version is specified in [`package.json`](./package.json))
- **npm** (usually bundled with Node.js)
- **[PostgreSQL](https://www.postgresql.org/)** database (version 12+ recommended)

---

## Installation Steps

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/orbit-track.git
   ```

2. **Navigate to the backend directory**:

   ```bash
   cd orbit-track/backend
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Environment Configuration**:

   - This service requires a PostgreSQL connection URL. Set the `DATABASE_URL` environment variable to your Postgres connection string, for example:
     ```bash
     export DATABASE_URL="postgresql://user:password@localhost:5432/orbit_track_db"
     ```
   - If `DATABASE_URL` is **not** provided, a default connection string defined in [`app.js`](./app.js) will be used:
     ```javascript
     const dbUrl = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/orbit_track_db';
     ```

---

## Database Setup

1. **Create the Database**:

   - Make sure your PostgreSQL server is running.
   - Create a new database (e.g., `orbit_track_db`) if it doesn't already exist.

2. **Run the Migration Script**:
   - Execute the contents of [`database_migration.sql`](./database_migration.sql) in your PostgreSQL database:
     ```sql
     -- Example usage in psql:
     \i path/to/database_migration.sql
     ```
   - This script creates the following:
     - **users** table (with a `drop` statement that removes any existing table—use caution in production).
     - **favorite_tokens** table (also includes a `drop` statement).
     - **Indexes** for performance.

> **Important**: The `DROP TABLE` statements can **remove existing data**. Use with caution in production environments.

---

## Running the Application

- **Production Mode**:

  ```bash
  npm start
  ```

  The server listens on **port 4000** by default.

- **Development Mode (with Hot Reloading)**:
  ```bash
  npm run dev
  ```
  This starts the server with automatic restarts on file changes, which is ideal for local development.

---

## Testing Instructions

1. **Run All Tests**:
   ```bash
   npm test
   ```
2. **Test Structure**:
   - Tests are located in the [`test`](./test) directory.
   - We use Node.js's built-in test runner for testing.
3. **Mocks**:
   - **Database Mocks**: [`test/utils/mockPgClient.js`](./test/utils/mockPgClient.js) mocks PostgreSQL interactions.
   - **External Service Mocks**: [`test/utils/mockFetch.js`](./test/utils/mockFetch.js) mocks external HTTP requests.

This setup ensures tests do not rely on a live database or external services, allowing for consistent and reliable test runs.

---

## API Documentation

This service exposes a **GraphQL** endpoint at:

```
http://localhost:4000/graphql
```

### Queries

- **`trendingPools`**  
  Returns a list of trending pools/tokens.

  ```graphql
  query {
    trendingPools {
      id
      symbol
      volume
    }
  }
  ```

- **`favoritesByUser`**  
  Fetches a user's favorite tokens.

  ```graphql
  query($userId: ID!) {
    favoritesByUser(userId: $userId) {
      tokenId
      symbol
    }
  }
  ```

- **`getMultipleTokens`**  
  Retrieves multiple token details by IDs or symbols.
  ```graphql
  query($symbols: [String!]!) {
    getMultipleTokens(symbols: $symbols) {
      symbol
      price
    }
  }
  ```

### Mutations

- **`createUserWithPublicKey`**  
  Creates a user record with the provided public key.

  ```graphql
  mutation($publicKey: String!) {
    createUserWithPublicKey(publicKey: $publicKey) {
      id
      publicKey
    }
  }
  ```

- **`addFavoriteToken`**  
  Adds a token to the user's favorites.

  ```graphql
  mutation($userId: ID!, $tokenId: String!) {
    addFavoriteToken(userId: $userId, tokenId: $tokenId) {
      userId
      tokenId
    }
  }
  ```

- **`removeFavoriteToken`**  
  Removes a token from the user's favorites.
  ```graphql
  mutation($userId: ID!, $tokenId: String!) {
    removeFavoriteToken(userId: $userId, tokenId: $tokenId) {
      success
    }
  }
  ```

For more details on the schema, see the **GraphQL schema** defined in [`app.js`](./app.js).

---

## Docker Usage

1. **Build the Docker Image**:

   ```bash
   docker build -t orbit-track-backend .
   ```

   - See [`Dockerfile`](./Dockerfile) for build instructions.
   - The base image is **`node:18-alpine`** to keep the image lightweight and secure.
   - A non-root user is added to enhance security within the container.

2. **Run the Container**:

   ```bash
   docker run -p 4000:4000 --env DATABASE_URL="postgresql://user:password@host:port/dbname" orbit-track-backend
   ```

   - Map **port 4000** (internal) to a port on your host (e.g., `-p 4000:4000`).
   - Pass in `DATABASE_URL` via `--env` if needed.

3. **.dockerignore**:
   - The [.dockerignore](./.dockerignore) file excludes unnecessary files from the Docker build context (e.g., `node_modules`, local logs, etc.).

---

## System Architecture

Here’s a simplified overview of how this backend works:

1. **Fastify Server**: Set up in [`app.js`](./app.js).
2. **Mercurius Integration**: Fastify plugin for GraphQL, handling queries/mutations.
3. **PostgreSQL Database**: Connected via `@fastify/postgres`, configured to use `DATABASE_URL` or a default local connection.
4. **Request Flow**:
   - **Client** → **GraphQL Query/Mutation** → **Mercurius** → **Resolvers**
   - **Resolvers** may fetch data from:
     - **Database** (via `@fastify/postgres` and direct SQL queries).
     - **External APIs** (if needed).
   - **Response** is returned to the client in GraphQL format.
5. **Performance**:
   - Indexes defined in [`database_migration.sql`](./database_migration.sql) help with fast lookups of user favorites, tokens, etc.
   - Fastify’s low overhead ensures quick request handling.
