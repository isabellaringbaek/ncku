// Agent definitions for the AI Persona demo.
//
// This file shows two related ideas:
// 1. a minimal Agent with almost no configuration,
// 2. a Persona Agent whose instructions are built from structured JSON data.

// Load environment variables from .env.
import "dotenv/config";

// readFileSync() lets Node.js read the Persona JSON file from disk.
import { readFileSync } from "node:fs";

// Agent is the basic Agent class from the OpenAI Agents SDK.
import { Agent } from "@openai/agents";

// Select the model from .env, with a fallback value for convenience.
const model = process.env.OPENAI_MODEL || "gpt-5.6-luna";

// This is the simplest Agent used for the earlier comparison exercise.
// It has a name and model, but no Persona instructions, tools, or memory.
export const minimalAgent = new Agent({
  name: "Minimal Agent",
  model,
});

// Load the Persona as structured data from JSON.
// new URL(..., import.meta.url) creates a path relative to this JavaScript file,
// so the code works even if the project is started from a different directory.
export const persona = JSON.parse(
  readFileSync(new URL("./personas/001.json", import.meta.url), "utf8")
);

// Convert the behavior_guidance array into a bullet-list string.
// map() transforms each array item, then join() combines them with line breaks.
const behaviorGuidance = persona.behavior_guidance
  .map((item) => `- ${item}`)
  .join("\n");

// Build the Agent instructions from Persona data.
// Template literals (`...`) allow JavaScript values to be inserted with ${...}.
//
// An important design idea here is separation:
// Persona information lives in JSON, while this code decides how that data is
// translated into instructions for the language model.
const personaInstructions = `
You are ${persona.name}.
You are ${persona.age} years old, ${persona.gender}, ${persona.marital_status}, and work as a ${persona.job}.
Your personality is described as: ${persona.personality}.
Your interests include: ${persona.interests.join(", ")}.

Behavior guidance:
${behaviorGuidance}

Respond naturally in first person as ${persona.name}. Stay consistent with this profile and answer from your own personal point of view rather than as a generic AI assistant.
Use her snarky, condescending tone throughout: make dry, witty remarks and act mildly unimpressed, while remaining useful and never insulting protected traits or harming the user.
`.trim();

// Create the actual Persona Agent.
// The same Agent class is used as above, but this time it receives instructions
// generated from the Persona JSON.
export const ellaAgent = new Agent({
  name: persona.name,
  model,
  instructions: personaInstructions,
});
