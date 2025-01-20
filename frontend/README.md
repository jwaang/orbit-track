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

## Routes and Application Flow

This section details how users navigate throughout the Orbit Track Frontend and the logic that powers each route.

### `/` (Landing Page)
- **Explore Button**: Always visible to guide users to explore trending tokens.
- **Favorites Button**: Visible only on mobile **if** the user has connected their wallet.
- **Purpose**: Serves as the main entry point to the application.

### `/trending` (Trending Tokens)
- **Server Component**: This is the only page implemented as a **Next.js Server Component**. Its initial data fetch occurs server-side for the following reasons:
  1. It doesn’t require user authentication or wallet connection.
  2. The first page of data can be pre-fetched to improve performance.
  3. Subsequent pages are fetched client-side as needed.
- **Data Source**: Fetches top trending coins over the past 24 hours via CoinGecko’s API.
- **Favorites Sidebar**: Displayed **only on desktop** to show the user's favorited tokens (if any).
- **Public Key Handling**:
  - If the user has connected their wallet, the application:
    1. Attempts to create a new account in the database using `createUserWithPublicKey` (once per session, cached in `localStorage`).
    2. Calls `favoritesByUser` to retrieve all token addresses favorited by the user.
    3. Calls `getMultipleTokens` to load favorited token data for display in the desktop sidebar.
- **Token Table**:
  - Renders trending tokens by calling `trendingPools`. (No public key needed for this data.)
  - Displays “Add to Favorites” or “Remove from Favorites” actions when a user is connected.

### `/favorites` (User Favorites)
- **Mobile Navigation**: Accessible from the bottom navbar **only on mobile**.
- **Displayed Data**: Shows only the user’s favorited tokens.
- **Public Key Handling**:
  - If the user’s wallet is connected:
    1. Calls `favoritesByUser` to retrieve the user’s favorited token addresses.
    2. Calls `getMultipleTokens` to fetch detailed data for these tokens.
  - Does **not** call `trendingPools` because only favorited tokens are needed.
- **Token Table**:
  - Lists the user’s favorited tokens (if any).
  - Allows adding/removing favorites (via `addFavoriteToken` or `removeFavoriteToken`) if the user is connected.

---

## Wallet Connection and Account Creation

When a user connects their wallet on the `/trending` or `/favorites` page, the app:

1. Calls `createUserWithPublicKey` to create (or retrieve) the user’s account in the database.
2. Stores the public key in `localStorage` to avoid repeated creation calls.

---

## VirtualizedDataTable and Limitations

- **Pagination & Infinite Scroll**:
  - Supports pagination (up to 10 pages) to align with the CoinGecko API’s data limits.
  - Uses infinite scroll to load additional pages.
  - **Toast Notification**: If the user attempts to load more than 10 pages, a toast message appears indicating no more data is available.

- **Large Data Sets**:
  - Utilizes table virtualization to efficiently render large lists of tokens, keeping the UI responsive.

- **Favorite Token Limit**:
  - The `getMultipleTokens` query can only handle up to 30 tokens due to CoinGecko’s API limits.
  - A user can therefore only favorite **up to 30 tokens**.
  - **Toast Notification**: If the user tries to exceed the 30-token favorite limit, a toast message appears, preventing any further additions.


---

## Wallet Connection and Account Creation

When a user connects their wallet on the `/trending` or `/favorites` page, the app:

1. Calls `createUserWithPublicKey` to create (or retrieve) the user’s account in the database.
2. Stores the public key in `localStorage` to avoid repeated creation calls.

---

## VirtualizedDataTable and Limitations

- **Pagination & Infinite Scroll**:

  - Supports pagination (up to 10 pages) to align with the CoinGecko API’s data limits.
  - Uses infinite scroll to load additional pages.
  - **Toast Notification**: If the user attempts to load more than 10 pages, a toast message appears indicating no more data is available.

- **Large Data Sets**:

  - Utilizes table virtualization to efficiently render large lists of tokens, keeping the UI responsive.

- **Favorite Token Limit**:
  - The `getMultipleTokens` query can only handle up to 30 tokens due to CoinGecko’s API limits.
  - A user can therefore only favorite **up to 30 tokens**.
  - **Toast Notification**: If the user tries to exceed the 30-token favorite limit, a toast message appears, preventing any further additions.

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
