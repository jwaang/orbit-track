# Orbit Track

**Orbit Track** is a full-stack application composed of a frontend (Next.js) and a backend (Fastify GraphQL). This project provides real-time data on trending tokens, user management functionality, and favorite token tracking.

## Demo

https://github.com/user-attachments/assets/2654f583-c6d5-4fa7-ac6e-463279a89b30

[![OrbitTrack Detailed Demo](https://img.youtube.com/vi/hkdfiLumP-s/0.jpg)](https://youtu.be/hkdfiLumP-s)

---

## Documentation

- [Frontend Documentation](frontend/README.md)  
  Learn about installation, development, and deployment specifics for the Next.js frontend.

- [Backend Documentation](backend/README.md)  
  Explore how to set up the Fastify GraphQL server, configure the database, and use the API.

---

## Quick Start with Docker Compose

For a unified setup of both the frontend and backend services, run:

```bash
docker-compose up --build
```

This will:

1. Build and start the containers for both the frontend and backend.
2. Expose the necessary ports (e.g., 3000 for frontend and 4000 for backend).

You can then access:

- **Frontend** at [http://localhost:3000](http://localhost:3000)
- **Backend** GraphQL endpoint at [http://localhost:4000/graphql](http://localhost:4000/graphql)
