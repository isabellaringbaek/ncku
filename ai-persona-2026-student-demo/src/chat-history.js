import { assistant, user } from "@openai/agents";

export function isValidChatInput(messages) {
  return (
    Array.isArray(messages) &&
    messages.length > 0 &&
    messages.length % 2 === 1 &&
    messages.every((message, index) => {
      const expectedRole = index % 2 === 0 ? "user" : "assistant";
      return (
        message !== null &&
        typeof message === "object" &&
        message.role === expectedRole &&
        typeof message.content === "string" &&
        message.content.trim().length > 0
      );
    })
  );
}

export function toAgentInput(messages) {
  return messages.map(({ role, content }) =>
    role === "user" ? user(content) : assistant(content),
  );
}
