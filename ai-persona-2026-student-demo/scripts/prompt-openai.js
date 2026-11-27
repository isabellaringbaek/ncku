// Terminal experiment using the OpenAI API directly.
//
// This is intentionally a "raw model call" example. It is useful for
// comparing a direct API request with the Agents SDK example in prompt-agent.js.

// Load variables from .env into process.env.
import "dotenv/config";

// OpenAI is the official JavaScript client used to call the API.
import OpenAI from "openai";

// readline provides an interactive text prompt in the terminal.
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

// Read configuration from environment variables.
// The model has a fallback value so the program still knows which model to use
// if OPENAI_MODEL is not written in .env.
const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-5.6-luna";

// API keys are required for authenticated requests.
if (!apiKey) {
  console.error("Missing OPENAI_API_KEY.");
  console.error("Create a local .env file and add your OpenAI API key.");
  process.exit(1);
}

// Create one API client using the secret key.
const client = new OpenAI({ apiKey });

// Connect readline to the terminal's input and output streams.
const rl = createInterface({ input, output });

try {
  console.log(`Model: ${model}`);
  console.log("Enter a prompt to send directly to the OpenAI model.\n");

  // Wait for the user to type a prompt.
  const prompt = (await rl.question("Prompt: ")).trim();

  if (!prompt) {
    console.error("Prompt cannot be empty.");
    process.exitCode = 1;
  } else {
    // responses.create() sends one request to the model.
    // Notice that this example contains no Agent object, tools, or memory.
    const response = await client.responses.create({
      model,
      input: prompt,
    });

    console.log("\nModel response:\n");
    console.log(response.output_text);
  }
} catch (error) {
  // Errors may come from networking, authentication, model access, or the API.
  console.error("\nOpenAI API request failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  // Close readline whether the request succeeds or fails.
  rl.close();
}
