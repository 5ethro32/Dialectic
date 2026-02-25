import { getAIClient, getUserApiKey, MODEL_CONFIG } from './provider';

interface ResearchResult {
  source_title: string;
  source_url: string | null;
  summary: string;
  relevance_score: number;
}

export async function conductResearch(
  query: string,
  purpose: string,
  caseTitle: string,
  positionLabel: string,
  userId: string
): Promise<ResearchResult> {
  const userApiKey = await getUserApiKey(userId);
  const client = getAIClient(userApiKey);

  const response = await client.messages.create({
    model: MODEL_CONFIG.research,
    max_tokens: 1000,
    system: `You are a research assistant for the Dialectic debate platform. Your job is to find relevant information to support a debate position.

The case is about: "${caseTitle}"
The position you're supporting: "${positionLabel}"
The purpose of this research: "${purpose}"

Provide factual, well-sourced information. If you're drawing on training data rather than live sources, be transparent about that.

Respond with JSON only:
{
  "source_title": "Title of the source or topic",
  "source_url": null,
  "summary": "2-3 paragraph summary of relevant findings with specific data points where possible",
  "relevance_score": 0.85,
  "note": "Based on training data — verify independently for the most current figures"
}`,
    messages: [{
      role: 'user',
      content: `Research query: ${query}`,
    }],
  });

  const block = response.content[0];
  const text = block.type === 'text' ? block.text : '';

  try {
    // Try to parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // If parsing fails, wrap the text response
  }

  return {
    source_title: `Research: ${query}`,
    source_url: null,
    summary: text,
    relevance_score: 0.7,
  };
}
