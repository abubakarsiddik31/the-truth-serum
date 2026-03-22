# The Truth Serum

> *"Marketing is what you say about yourself. Truth is what people say about you on Reddit at 3 AM."*

**The Truth Serum** is a voice-first AI agent that debunks marketing hype. It scours Reddit and forums using **Firecrawl** and responds with brutally honest findings via **ElevenLabs Conversational AI**.

Speak to it. Ask about any product, brand, or trend. Get the real deal.

---

## Features

- **Voice-First** — Powered by ElevenLabs Conversational AI (WebRTC/WebSocket)
- **Real-Time Web Scouring** — Uses Firecrawl to scrape Reddit & forums for authentic sentiment
- **Mobile-First UI** — Clean, responsive design optimized for phone (dictate-style interface)
- **Light/Dark Mode** — Toggle between themes, light by default
- **Sassy Personality** — Agent persona that doesn't pull punches when debunking hype
- **Live Transcript** — See the conversation, tool actions, and findings in real-time

---

## Demo & Screenshots

### Demo Video

- [Watch the demo video](./resources/Demo.mov)

### Screenshots

![Screenshot 1](./resources/app-screenshot-01.png)
![Screenshot 2](./resources/app-screenshot-02.png)
![Screenshot 3](./resources/app-screenshot-03.png)
![Screenshot 4](./resources/app-screenshot-04.png)
![Screenshot 5](./resources/app-screenshot-05.png)
![Screenshot 6](./resources/app-screenshot-06.png)
![Screenshot 7](./resources/app-screenshot-07.png)

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS 4, ElevenLabs React SDK |
| Backend | Node.js, Express 5, TypeScript, Firecrawl SDK, tsx |
| Infra | Docker Compose, nginx |
| Tooling | Concurrently, ESLint |

---

## Project Structure

```
the-truth-serum/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # UI components
│   │   │   ├── Header.tsx
│   │   │   ├── VoiceButton.tsx
│   │   │   ├── ConversationFeed.tsx
│   │   │   ├── TextInput.tsx
│   │   │   └── AnalysisCard.tsx
│   │   ├── lib/                # Shared utils & types
│   │   │   ├── utils.ts
│   │   │   ├── types.ts
│   │   │   └── useTheme.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── .env.example
├── server/                     # Express backend (TypeScript)
│   ├── index.ts                # Entry point
│   ├── src/
│   │   ├── app.ts              # Express app setup
│   │   ├── config/
│   │   │   ├── env.ts          # Centralized env config
│   │   │   └── firecrawl.ts    # Firecrawl client
│   │   ├── routes/
│   │   │   ├── health.ts       # GET /api/health
│   │   │   ├── elevenlabs.ts   # GET /api/elevenlabs/signed-url
│   │   │   └── search.ts       # POST /api/search
│   │   ├── services/
│   │   │   ├── elevenlabs.ts   # Signed URL logic
│   │   │   └── search.ts       # Firecrawl search + scoring
│   │   ├── utils/
│   │   │   ├── extractTopic.ts
│   │   │   └── extractFindings.ts
│   │   └── middleware/
│   │       └── errorHandler.ts
│   └── .env.example
├── infra/                      # Docker config
│   ├── docker-compose.yml
│   ├── Dockerfile.client
│   └── Dockerfile.server
└── package.json                # Root orchestration
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **Firecrawl API Key** — [firecrawl.dev](https://firecrawl.dev)
- **ElevenLabs API Key** — [elevenlabs.io](https://elevenlabs.io)
- **ElevenLabs Agent ID** — Create one in the [ElevenLabs Dashboard](https://elevenlabs.io/app/conversational-ai)

### Setup

```bash
git clone https://github.com/abubakarsiddik31/the-truth-serum.git
cd the-truth-serum
npm run install-all
```

### Environment Variables

**`server/.env`**
```env
FIRECRAWL_API_KEY=your_firecrawl_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_AGENT_ID=your_agent_id
PORT=3001
```

**`client/.env`**
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_ELEVENLABS_AGENT_ID=your_agent_id
```

### Run

```bash
npm run dev
```

This starts both the client (Vite) and server (tsx watch) concurrently.

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client + server |
| `npm run client` | Start frontend only |
| `npm run server` | Start backend only |
| `npm run build` | Build both for production |

### Docker

```bash
cd infra
docker compose up --build
```

Client runs on `http://localhost:5173`, server on `http://localhost:3001`.

---

## How It Works

1. **Speak** — User asks about a product, brand, or trend via microphone
2. **Route** — ElevenLabs agent triggers the `/api/search` tool endpoint
3. **Scrape** — Backend uses Firecrawl to search Reddit & forums
4. **Score** — Findings are ranked by skeptic-keyword relevance
5. **Respond** — Agent delivers a brutally honest summary via voice

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Push and open a PR

---

## License

ISC

---

*Built with salt and cynicism during ElevenLabs Hacks.*
