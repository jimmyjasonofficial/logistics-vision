'use server';

import {
  planRoute,
  RoutePlannerInput,
  RoutePlannerOutput,
} from '@/ai/flows/route-planner-flow';

export async function planRouteAction(
  input: RoutePlannerInput
): Promise<RoutePlannerOutput | { error: string }> {
  try {
    const result = await planRoute(input);
    return result;
  } catch (e: any) {
    console.error('AI route planning failed:', e);
    return { error: e.message || 'Failed to plan route with AI.' };
  }
}
