import Anthropic from '@anthropic-ai/sdk';

let defaultClient: Anthropic | null = null;

export function getAIClient(userApiKey?: string | null): Anthropic {
  // Priority: user's own key > app default key
  if (userApiKey) {
    return new Anthropic({ apiKey: userApiKey });
  }

  const defaultKey = process.env.ANTHROPIC_API_KEY;
  if (!defaultKey) {
    throw new Error('No AI provider configured. Set ANTHROPIC_API_KEY or add your own key in settings.');
  }

  if (!defaultClient) {
    defaultClient = new Anthropic({ apiKey: defaultKey });
  }

  return defaultClient;
}

export const MODEL_CONFIG = {
  counsel: 'claude-sonnet-4-20250514',
  research: 'claude-sonnet-4-20250514',
  judge: 'claude-sonnet-4-20250514',
} as const;

export async function getUserApiKey(userId: string): Promise<string | null> {
  // Import dynamically to avoid circular deps
  const { createServiceRoleClient } = await import('@/lib/supabase/server');
  const supabase = await createServiceRoleClient();

  const { data } = await supabase
    .from('profiles')
    .select('encrypted_api_key')
    .eq('id', userId)
    .single();

  return data?.encrypted_api_key || null;
}
