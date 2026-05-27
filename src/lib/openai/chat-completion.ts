export type ChatRole = "system" | "user" | "assistant";

export type ChatCompletionMessage = {
  role: ChatRole;
  content: string;
};

export type ChatCompletionOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
};

export async function createChatCompletion(
  messages: ChatCompletionMessage[],
  options: ChatCompletionOptions = {}
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const model =
    options.model?.trim() ||
    process.env.OPENAI_STORY_MODEL?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    "gpt-4o-mini";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
      ...(options.jsonMode ? { response_format: { type: "json_object" } } : {}),
      messages,
    }),
  });

  if (!response.ok) {
    console.error("OpenAI chat completion error", await response.text());
    return null;
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  return data.choices?.[0]?.message?.content?.trim() ?? null;
}
