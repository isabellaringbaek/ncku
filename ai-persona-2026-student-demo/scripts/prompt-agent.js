// Terminal experiment using the OpenAI Agents SDK.
//
// Compare this file with prompt-openai.js:
// - prompt-openai.js calls the model API directly.
// - this file runs a defined Agent through the Agents SDK.

// Load variables from the local .env file into process.env.
import "dotenv/config";

// run() executes an Agent.
import { run } from "@openai/agents";

// readline lets a Node.js program ask the user for text in the terminal.
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

// Import the simple Agent definition from src/agent.js.
import { minimalAgent } from "../src/agent.js";

// Stop early if the secret API key is missing.
if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY.");
  console.error("Create a local .env file and add your OpenAI API key.");
  process.exit(1);
}

// Connect readline to the terminal's standard input and output.
const rl = createInterface({ input, output });

try {
  console.log("Minimal Agent (Agents SDK)");
  console.log("Enter the same prompt you used with the raw API test.\n");

  // await pauses here until the user types a prompt and presses Enter.
  const prompt = (await rl.question("Prompt: ")).trim();

  if (!prompt) {
    console.error("Prompt cannot be empty.");
    process.exitCode = 1;
  } else {
    // The Agents SDK receives both the Agent definition and the user input.
    // In this minimal example the Agent has no tools or memory yet.
    const result = await run(minimalAgent, prompt);

    console.log("\nAgent response:\n");
    console.log(result.finalOutput);
  }
} catch (error) {
  // Catch API, network, or Agent runtime errors so they are readable.
  console.error("\nAgent run failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  // Always close the terminal interface when the program finishes.
  rl.close();
}
