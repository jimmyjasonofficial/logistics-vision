'use server';

import {
  suggestReconciliationMatches,
  ReconciliationInput,
  ReconciliationOutput,
} from '@/ai/flows/reconciliation-flow';

export async function suggestMatchesAction(
  input: ReconciliationInput
): Promise<ReconciliationOutput | { error: string }> {
  try {
    const suggestions = await suggestReconciliationMatches(input);
    return suggestions;
  } catch (e: any) {
    console.error('AI reconciliation failed:', e);
    return { error: e.message || 'Failed to get AI suggestions.' };
  }
}
