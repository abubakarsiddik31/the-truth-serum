# PRD: The Truth Serum (No-Bullshit Researcher)

## 1. Goal
Build a high-impact, viral-potential voice agent that uses **Firecrawl Search** and **ElevenAgents** to debunk marketing hype by scouring Reddit and forums for real human opinions.

## 2. Core Experience
- **User Interface:** A minimalist, "top-secret" or "no-nonsense" aesthetic (dark mode, high contrast).
- **Interaction:** User speaks a brand, product, or trend (e.g., "Is the new Cybertruck actually good?").
- **Agent Action:** 
    1. Triggers a Firecrawl Search specifically targeting `site:reddit.com` or `site:forum.com`.
    2. Summarizes the "real deal" (the complaints, the hidden bugs, the actual user sentiment).
    3. Responds in a "sassy," cynical, and brutally honest voice.
- **Viral Factor:** The agent's personality is unhinged and doesn't hold back, making for great social media clips.

## 3. Technical Requirements
### Frontend (React/Next.js)
- **ElevenLabs Conversational AI SDK:** To handle voice input/output and agent state.
- **Tailwind CSS:** For the "brutalist" UI.
- **Real-time Transcript:** Display what the agent is finding as it "scours" the web.

### Backend (Node.js/Express)
- **Tool Endpoint:** A `/api/search` route that the ElevenLabs agent calls as a "Server Tool".
- **Firecrawl SDK:** To execute the `site:reddit.com` search and return clean Markdown content.
- **Filtering Logic:** Extract only the most relevant "truth" (top-voted comments/sentiments).

### APIs
- **Firecrawl API Key:** For web scraping and searching.
- **ElevenLabs API Key:** For the voice agent and TTS.
- **ElevenLabs Agent ID:** A pre-configured agent with the "Sassy Researcher" persona.

## 4. Milestone Plan
1. **Phase 1: Research & Tool Setup** (Define the Tool Schema for ElevenLabs).
2. **Phase 2: Backend Bridge** (Implement the Firecrawl Search tool).
3. **Phase 3: ElevenLabs Agent Config** (Configure the persona and connect the tool).
4. **Phase 4: Frontend UI** (Build the "Truth Serum" dashboard).
5. **Phase 5: Refinement & "Sass" Tuning** (Optimize the prompt for maximum viral potential).

## 5. Success Metrics
- Successfully retrieves Reddit data for any niche query.
- Agent response time < 2 seconds.
- Personality feels distinct and "viral-ready".
