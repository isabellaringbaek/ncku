// Minimal OpenAI API connectivity test.
//
// The goal of this file is not to build an application. It only checks that:
// 1. Node.js can read the local .env file,
// 2. the API key is available,
// 3. the OpenAI client can send a request and receive a response.

// dotenv/config automatically loads variables from .env into process.env.
import "dotenv/config";

// Import the OpenAI JavaScript client.
import OpenAI from "openai";

// Read configuration from environment variables instead of hard-coding secrets.
const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-5.6-luna";

// Fail early with a clear message if the API key is missing.
if (!apiKey) {
    console.error("Missing OPENAI_API_KEY.");
    console.error("Copy .env.example to .env and add your OpenAI API key.");
    process.exit(1);
}

// Create a reusable API client authenticated with the API key.
const client = new OpenAI({ apiKey });

try {
    console.log(`Testing OpenAI API connection with model: ${model}`);

    // Send one very small request through the Responses API.
    // The object passed to create() contains the model and the user's input.
    const response = await client.responses.create({
        model,
        input:
            "Reply with one short sentence confirming that the OpenAI API connection is working.",
    });

    // output_text is the convenience property containing the model's text reply.
    console.log("\nOpenAI response:");
    console.log(response.output_text);
} catch (error) {
    // Catch errors so authentication or network problems are easier to diagnose.
    console.error("\nOpenAI API request failed.");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
}
