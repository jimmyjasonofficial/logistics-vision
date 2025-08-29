import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const RoutePlannerInputSchema = z.object({
  origin: z.string(),
  destination: z.string(),
});
export type RoutePlannerInput = z.infer<typeof RoutePlannerInputSchema>;

export const RoutePlannerOutputSchema = z.object({
  waypoints: z.array(z.string()),
  totalDistance: z.number(),
  estimatedTime: z.string(),
  summary: z.string(),
});
export type RoutePlannerOutput = z.infer<typeof RoutePlannerOutputSchema>;

const prompt = ai.definePrompt({
  name: 'routePlannerPrompt',
  input: { schema: RoutePlannerInputSchema },
  output: { schema: RoutePlannerOutputSchema },
  prompt: `You are a logistics expert specializing in truck route optimization in the United States.
  Your task is to plan the most efficient route for a semi-truck traveling from {{origin}} to {{destination}}.

  Consider the following factors for a commercial truck:
  - Major highways and interstates are preferred.
  - Avoid city centers with heavy traffic where possible.
  - Assume standard truck speed limits.

  Provide a list of waypoints, the total estimated distance in kilometers, the estimated travel time, and a brief summary of the route.
  `,
});

const routePlannerFlow = ai.defineFlow(
  {
    name: 'routePlannerFlow',
    inputSchema: RoutePlannerInputSchema,
    outputSchema: RoutePlannerOutputSchema,
  },
  async (input:any) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function planRoute(input: RoutePlannerInput) {
  return routePlannerFlow(input);
}