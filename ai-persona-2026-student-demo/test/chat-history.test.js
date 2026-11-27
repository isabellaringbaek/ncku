import assert from "node:assert/strict";
import test from "node:test";
import { isValidChatInput, toAgentInput } from "../src/chat-history.js";

test("accepts a conversation ending with a new user turn", () => {
  assert.equal(
    isValidChatInput([
      { role: "user", content: "My dog's name is Cookie." },
      { role: "assistant", content: "I'll remember Cookie." },
      { role: "user", content: "What is my dog's name?" },
    ]),
    true,
  );
});

test("rejects incomplete, out-of-order, and empty turns", () => {
  assert.equal(isValidChatInput([]), false);
  assert.equal(
    isValidChatInput([
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi" },
    ]),
    false,
  );
  assert.equal(
    isValidChatInput([
      { role: "user", content: "Hello" },
      { role: "user", content: "Another user turn" },
      { role: "user", content: "Question" },
    ]),
    false,
  );
  assert.equal(isValidChatInput([{ role: "user", content: "   " }]), false);
});

test("converts each turn to the Agents SDK's structured input items", () => {
  const input = toAgentInput([
    { role: "user", content: "My dog's name is Cookie." },
    { role: "assistant", content: "I'll remember Cookie." },
  ]);

  assert.deepEqual(
    input.map(({ role }) => role),
    ["user", "assistant"],
  );
  assert.deepEqual(input[0].content, [
    { type: "input_text", text: "My dog's name is Cookie." },
  ]);
  assert.deepEqual(input[1].content, [
    { type: "output_text", text: "I'll remember Cookie." },
  ]);
});
