# El Buvette

**El Buvette** is the university's cafeteria — a web challenge built around its theme.

## Overview

This challenge simulates a web application for El Buvette, the university cafeteria, where students can browse and interact with the menu and services offered on campus.

## Structure

- `El Buvette/` — Frontend (React + Vite + TypeScript)
- `Dockerfile.backend` / `Dockerfile.frontend` — Docker configurations
- `docker-compose.yml` — Orchestrates the full stack
- `nginx.conf` — Reverse proxy configuration

## Backend

The backend is a **Node.js** REST API built with **Express.js**, running on port `4000`. It exposes a single endpoint:

- `POST /functions/v1/search-products` — Searches the product catalog

It uses an **in-memory data store** (no external database) to simulate a cafeteria product listing, making it fully self-contained for CTF deployment.
