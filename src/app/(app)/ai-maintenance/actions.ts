'use server';

import {
  getMaintenanceRecommendations,
  MaintenanceInput,
  MaintenanceOutput,
} from '@/ai/flows/maintenance-recommendation';

export async function getRecommendationAction(
  input: MaintenanceInput
): Promise<MaintenanceOutput | { error: string }> {
  try {
    const recommendations = await getMaintenanceRecommendations(input);
    return recommendations;
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Failed to get recommendations.' };
  }
}
