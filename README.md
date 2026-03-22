# 🕵️‍♂️ The Truth Serum (No-Bullshit Researcher)

> _"Marketing is what you say about yourself. Truth is what people say about you on Reddit at 3 AM."_

**The Truth Serum** is a high-impact, viral-potential voice agent designed to debunk marketing hype. It scours Reddit and niche forums using **Firecrawl** and **ElevenLabs Conversational AI** to find real human opinions, complaints, and hidden truths about products, brands, or trends.

It responds in a sassy, cynical, and brutally honest tone—perfect for viral social media clips and getting the *real* deal on anything.

---

## 🔥 Key Features

-   **🗣️ Voice-First Interaction**: Powered by ElevenLabs Conversational AI for low-latency, high-personality voice interactions.
-   **🕵️ Real-Time Scouring**: Uses Firecrawl to search `site:reddit.com` and other forums for authentic user sentiment.
-   **⚡ Brutalist UI**: A minimalist, high-contrast "top-secret" aesthetic built with React and Tailwind CSS.
-   **🎭 Unhinged Personality**: Configurable agent persona that doesn't pull any punches when debunking hype.
-   **📝 Integrated Transcripts**: See what the agent is finding as it "scours" the dark corners of the web.

---

## 🛠️ Tech Stack

-   **Frontend**: React, Vite, TypeScript, Tailwind CSS, [ElevenLabs Conversational AI SDK](https://github.com/elevenlabs/elevenlabs-js).
-   **Backend**: Node.js, Express, [Firecrawl SDK](https://firecrawl.dev).
-   **Tooling**: Concurrently (for unified dev workflow).

---

## 📁 Project Structure

```text
the-truth-serum/
├── client/          # Vite + React Frontend
│   ├── src/         # UI Components and Logic
│   └── .env         # Frontend environment variables
├── server/          # Node.js + Express Backend
│   ├── index.js     # Main API and Tool Endpoint
│   └── .env         # Backend environment variables
├── package.json     # Root package manager (Scripts & Orchestration)
└── README.md        # You are here!
```

---

## 🚀 Getting Started

### Prerequisites

-   **Node.js** (v18 or later)
-   **Firecrawl API Key**: Get it at [firecrawl.dev](https://firecrawl.dev)
-   **ElevenLabs API Key**: Get it at [elevenlabs.io](https://elevenlabs.io)
-   **ElevenLabs Agent ID**: Create a Conversational Agent in the [ElevenLabs Dashboard](https://elevenlabs.io/app/conversational-ai).

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/abubakarsiddik31/the-truth-serum.git
    cd the-truth-serum
    ```

2.  **Install all dependencies**:
    ```bash
    npm install
    npm run install-all
    ```
    *This runs `npm install` in both `client/` and `server/` directories.*

3.  **Set up Environment Variables**:

    **Server (`server/.env`):**
    ```env
    FIRECRAWL_API_KEY=your_firecrawl_api_key
    ELEVENLABS_API_KEY=your_elevenlabs_api_key
    ELEVENLABS_AGENT_ID=your_agent_id
    PORT=3001
    ```

    **Client (`client/.env`):**
    ```env
    VITE_API_BASE_URL=http://localhost:3001
    VITE_ELEVENLABS_AGENT_ID=your_agent_id
    ```

---

## 🏃‍♂️ Running the Project

You can start both the client and server simultaneously from the root directory:

```bash
npm run dev
```

### Individual Commands
-   `npm run client`: Start the Vite frontend dev server.
-   `npm run server`: Start the Express backend server.
-   `npm run install-all`: Clean install for both subprojects.

---

## 🛠️ How it Works

1.  **Input**: The user speaks to the agent (e.g., "Is the Cybertruck worth it?").
2.  **Bridge**: The ElevenLabs agent triggers a **Server Tool** pointing to the backend `/api/search` route.
3.  **Search**: The backend uses **Firecrawl** to scrape top results from Reddit/forums.
4.  **Analysis**: The backend extracts the most critical sentiments and returns them to the agent.
5.  **Output**: The agent summarizes the findings in its signature "truth serum" persona.

---

## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the ISC License. See `LICENSE` for more information.

---

*Built with salt and cynicism during ElevenLabs Hacks.* 🧪🔥
