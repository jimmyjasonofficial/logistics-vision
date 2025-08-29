/**
 * @fileOverview A vehicle maintenance recommendation AI agent.
 *
 * - getMaintenanceRecommendations - A function that handles the vehicle maintenance recommendation process.
 * - MaintenanceInput - The input type for the getMaintenanceRecommendations function.
 * - MaintenanceOutput - The return type for the getMaintenanceRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const MaintenanceInputSchema = z.object({
  model: z.string().describe('The model of the vehicle.'),
  year: z.number().describe('The manufacturing year of the vehicle.'),
  mileage: z.number().describe('The current mileage of the vehicle.'),
  issues: z.string().optional().describe('Any specific issues the user is noticing.'),
});
export type MaintenanceInput = z.infer<typeof MaintenanceInputSchema>;

export const MaintenanceOutputSchema = z.object({
  recommendations: z.array(z.object({
    title: z.string().describe('The short title of the maintenance task.'),
    description: z.string().describe('A detailed description of why this maintenance is recommended.'),
  })).describe('A list of maintenance recommendations.'),
  urgency: z.enum(['Low', 'Medium', 'High', 'Immediate']).describe('The overall urgency of the required maintenance.'),
});
export type MaintenanceOutput = z.infer<typeof MaintenanceOutputSchema>;

export async function getMaintenanceRecommendations(input: MaintenanceInput): Promise<MaintenanceOutput> {
  return maintenanceRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'maintenancePrompt',
  input: {schema: MaintenanceInputSchema},
  output: {schema: MaintenanceOutputSchema},
  prompt: `You are an expert truck mechanic with 30 years of experience working on commercial fleets.
  A user is asking for maintenance recommendations for their vehicle.

  Vehicle Details:
  - Model: {{model}}
  - Year: {{year}}
  - Mileage: {{mileage}}
  {{#if issues}}- Reported Issues: {{issues}}{{/if}}

  Based on the vehicle's details and standard maintenance schedules for commercial trucks, provide a list of recommendations.
  For each recommendation, provide a clear title and a description explaining its importance.
  Also, determine the overall urgency level for the combined maintenance tasks.
  Consider standard mileage-based service intervals, the age of the vehicle, and any specific issues reported.
  Prioritize safety-critical items.
  `,
});

const maintenanceRecommendationFlow = ai.defineFlow(
  {
    name: 'maintenanceRecommendationFlow',
    inputSchema: MaintenanceInputSchema,
    outputSchema: MaintenanceOutputSchema,
  },
  async (input:any) => {
    const {output} = await prompt(input);
    return output!;
  }
);
