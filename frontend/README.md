# Orbit Track - Frontend

## Project Overview

Welcome to **Orbit Track - Frontend**! This project aims to provide an intuitive and visually appealing platform for:

- Tracking trending tokens (cryptocurrencies or similar assets).
- Managing a list of favorite tokens for quick access.

Key features include:

- **Trending Tokens**: View real-time data on top trending pools/tokens.
- **Favorite Management**: Add or remove tokens from your favorites.
- **Responsive UI**: Tailored for both desktop and mobile experiences.
- **Animations**: Smooth transitions and animations powered by Framer Motion.

---

## Tech Stack

The frontend leverages the following core technologies:

- **[Next.js](https://nextjs.org/)**: A React framework with built-in server-side rendering and routing.
- **[TypeScript](https://www.typescriptlang.org/)**: A strongly typed superset of JavaScript.
- **[Apollo Client](https://www.apollographql.com/docs/react/)**: For state management and GraphQL integration. Configuration located in `lib/apollo-client.ts`.
- **[GraphQL](https://graphql.org/)**: A query language for APIs.
- **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework (see `tailwind.config.ts`).
- **[Framer Motion](https://www.framer.com/motion/)**: For animations and transitions.
- **[Docker](https://www.docker.com/)**: Containerization platform (see `Dockerfile` for build instructions).

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **[Node.js](https://nodejs.org/) (version 20 or higher)**
- **npm** (included with Node.js)
- **[Docker](https://www.docker.com/)** (optional, for containerization)

---

## Installation and Setup

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-username/orbit-track.git
   ```

2. **Navigate to the Frontend Directory**:

   ```bash
   cd orbit-track/frontend

   ```

3. **Install Dependencies**:

   ```bash
   npm install

   ```

   All required packages are listed in `package.json`.

4. **Set Up Environment Variables**:

   - Create a `.env` file (or `.env.local` for local development) in the `frontend` directory.

   - Define `NEXT_PUBLIC_GRAPHQL_URL`. For example:

     ```
     NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql

     ```

   - If not provided, it defaults to `http://localhost:4000/graphql`.

---

## Running the Application

### Development Server

Start the development server:

```bash
npm run dev

```

- By default, the app will run on [http://localhost:3000](http://localhost:3000/).

### Production Build

To build and run in production mode:

```bash
npm run build
npm start

```

- The production server will run on [http://localhost:3000](http://localhost:3000/).

---

## Docker Usage

### Build Docker Image

From the `frontend` directory, build the Docker image:

```bash
docker build -t orbit-track .

```

### Run Docker Container

Run the container:

```bash
docker run -p 3000:3000 orbit-track

```

- The application will be accessible at [http://localhost:3000](http://localhost:3000/).

---

## Project Structure

Below is a brief overview of the primary folders and files in the `frontend` directory:

```
frontend/
│
├─ app/
│   ├─ graphql/
│   │   ├─ queries/
│   │   └─ mutations/
│   ├─ layout.tsx
│   ├─ page.tsx
│   └─ ...
├─ components/
│   └─ ui/
│       ├─ button.tsx
│       └─ ...
├─ hooks/
│   ├─ use-toast.ts
│   └─ use-mobile.tsx
├─ lib/
│   └─ apollo-client.ts
├─ types/
│   └─ Token.ts
├─ Dockerfile
├─ next.config.mjs
├─ package.json
├─ tailwind.config.ts
└─ tsconfig.json

```

### Key Directories and Files

- **app/**: Contains the Next.js App Router files, including `layout.tsx` for layout components and `page.tsx` for the homepage.
- **components/**: Houses reusable UI components (e.g., buttons, inputs, tables).
- **hooks/**: Custom React hooks such as `useIsMobile` and `useToast`.
- **lib/**: Contains helper libraries and configuration files (e.g., Apollo Client setup in `apollo-client.ts`).
- **graphql/**: Stores GraphQL queries and mutations for data fetching and updates.
- **types/**: Defines TypeScript types and interfaces used throughout the project.
- **Configuration Files**:
  - `next.config.mjs`: Custom Next.js configuration.
  - `tsconfig.json`: TypeScript configuration.
  - `tailwind.config.ts`: Tailwind CSS configuration.
  - `Dockerfile`: Docker build instructions.

---

## Architecture Overview

### Routing

This project uses the **Next.js App Router** within the `app/` directory. Each folder and file in `app/` can represent a route, with special files like:

- **page.tsx**: The main entry point for a route.
- **layout.tsx**: Defines layout and composition for pages.

### State Management

**Apollo Client** is configured in `lib/apollo-client.ts`. It manages state through GraphQL queries and mutations, providing a consistent data layer across components.

### Data Flow

- Components such as `TokenTable.tsx` use queries from `app/graphql/queries` to fetch data (e.g., trending tokens).
- Data is displayed or manipulated in the UI.
- When necessary, mutations (e.g., adding/removing favorite tokens) update the backend via GraphQL.

### Custom Hooks

- **useIsMobile**: A custom hook that determines if the user is on a mobile device.
- **useToast**: A hook that manages toast notifications throughout the application.

---

## GraphQL Integration

1.  **API Endpoints**: The application communicates with a GraphQL endpoint defined by `NEXT_PUBLIC_GRAPHQL_URL`.
2.  **Queries**:
    - Example: `trendingPools` in `app/graphql/queries/trendingPools.ts` retrieves a list of trending tokens/pools.
3.  **Mutations**:
    - Handled similarly to queries. For instance, adding or removing a favorite token is performed via GraphQL mutations.

---

## Deployment

For a production deployment:

1.  **Set Environment Variables**: Ensure `NEXT_PUBLIC_GRAPHQL_URL` points to the production GraphQL endpoint.
2.  **Build the Project**: Run `npm run build`.
3.  **Start the Server**: Run `npm start` (or use Docker).
