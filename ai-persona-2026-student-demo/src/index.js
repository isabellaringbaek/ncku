// Express server for the AI Persona demo.
//
// This file connects the browser interface to the Persona Agent.
// It has three main responsibilities:
// 1. serve the files in /public,
// 2. provide Persona data through /api/persona,
// 3. receive interview questions through /api/chat and run the Agent.

// Load environment variables such as OPENAI_API_KEY and OPENAI_MODEL.
import "dotenv/config";

// path and fileURLToPath help us build reliable file-system paths in ES modules.
import path from "node:path";
import { fileURLToPath } from "node:url";

// Express is the web-server framework used in this demo.
import express from "express";

// run() executes an Agent from the OpenAI Agents SDK.
import { run } from "@openai/agents";

// Import both the Persona data and the Agent built from that data.
import { ellaAgent, persona } from "./agent.js";
import { isValidChatInput, toAgentInput } from "./chat-history.js";

// The backend must have access to the API key before it can call OpenAI.
// Notice that the key stays on the server and is never sent to the browser.
const apiKey = process.env.OPENAI_API_KEY?.trim();
if (!apiKey || /^your_|^sk-your_|^sk-placeholder/i.test(apiKey)) {
  console.error("Missing a valid OPENAI_API_KEY.");
  console.error("Set OPENAI_API_KEY in .env to your actual OpenAI API key.");
  process.exit(1);
}

// Create the Express application.
const app = express();

// Hosting platforms often provide their own PORT environment variable.
// When running locally, this demo falls back to port 3000.
const port = process.env.PORT || 3000;

// ES modules do not provide __dirname automatically, so we derive it here.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// publicDir points to the project's /public folder.
const publicDir = path.join(__dirname, "..", "public");

// express.json() allows Express to read JSON request bodies such as
// { "prompt": "What do you think about this product?" }.
app.use(express.json());

// express.static() makes index.html, app.js, style.css, and images available
// to the browser. Visiting http://localhost:3000 therefore opens the UI.
app.use(express.static(publicDir));

// GET /api/persona returns information that the browser is allowed to display.
app.get("/api/persona", (_req, res) => {
  // Object destructuring removes behavior_guidance before sending the profile.
  // This demonstrates that server-side data does not have to be fully exposed
  // to the front end.
  const { behavior_guidance, ...publicPersona } = persona;
  res.json(publicPersona);
});

// POST /api/chat receives the current conversation from the browser.
app.post("/api/chat", async (req, res) => {
  const messages = req.body?.messages;

  if (!isValidChatInput(messages)) {
    return res.status(400).json({
      error: "Messages must alternate between non-empty user and assistant turns and end with a user turn.",
    });
  }

  try {
    // Include the complete conversation so the Agent can use earlier turns.
    const result = await run(ellaAgent, toAgentInput(messages));

    // Send only the final text response back to the browser as JSON.
    return res.json({ response: result.finalOutput });
  } catch (error) {
    // Log the detailed error on the server, but return a simple message to the UI.
    console.error("Agent run failed:", error);
    return res.status(500).json({ error: "Agent request failed." });
  }
});

// Start listening for browser requests.
app.listen(port, () => {
  console.log(`AI Persona web service running at http://localhost:${port}`);
});
