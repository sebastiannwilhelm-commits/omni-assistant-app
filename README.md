# Omni-Assistant

Cross-platform AI assistant mobile application (React Native / Expo) and Node.js / Express backend for querying personal stats across gaming and social media accounts.

## Repository Structure

- [`/client`](./client) — Expo (React Native + TypeScript) mobile application featuring the Omni-Assistant chat interface.
- [`/server`](./server) — Express + TypeScript backend exposing `GET /health` and `POST /chat`.

## Getting Started

### 1. Start the Backend Server

```bash
cd server
npm install
npm run dev
```

The server listens on `http://localhost:3001` by default (configurable via `PORT` in `server/.env`).

### 2. Start the Mobile Client

```bash
cd client
npm install
npx expo start
```

- **Web**: Press `w` in the Expo CLI (connects to `http://localhost:3001`).
- **Android Emulator**: Press `a` (automatically connects to `http://10.0.2.2:3001`).
- **iOS Simulator / Physical Device**: Automatically resolves your machine's LAN IP via Expo host URI, or override with `EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:3001`.
