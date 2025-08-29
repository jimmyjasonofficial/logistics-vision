/**
 * @fileOverview An AI agent for bank reconciliation.
 *
 * - suggestReconciliationMatches - A function that suggests matches between bank and system transactions.
 * - ReconciliationInput - The input type for the suggestReconciliationMatches function.
 * - ReconciliationOutput - The return type for the suggestReconciliationMatches function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the schema for a single transaction
const TransactionSchema = z.object({
  id: z.string().describe('The unique identifier for the transaction.'),
  date: z.string().describe('The date of the transaction (YYYY-MM-DD).'),
  description: z.string().describe('A description of the transaction.'),
  amount: z.number().describe('The amount of the transaction.'),
  type: z.enum(['credit', 'debit']).describe('The type of transaction (credit or debit).'),
});

// Define the input schema for the flow
export const ReconciliationInputSchema = z.object({
  bankTransactions: z.array(TransactionSchema).describe('A list of transactions from the bank statement.'),
  systemTransactions: z.array(TransactionSchema).describe('A list of transactions from the internal accounting system (invoices and expenses).'),
});
export type ReconciliationInput = z.infer<typeof ReconciliationInputSchema>;

// Define the output schema for the flow
export const ReconciliationOutputSchema = z.object({
  suggestions: z.array(z.object({
    bankTransactionIds: z.array(z.string()).describe('An array of IDs for the matched bank transactions.'),
    systemTransactionIds: z.array(z.string()).describe('An array of IDs for the matched system transactions.'),
    reason: z.string().describe('A brief explanation of why these transactions were matched.'),
  })).describe('A list of suggested matches.'),
});
export type ReconciliationOutput = z.infer<typeof ReconciliationOutputSchema>;

// Exported wrapper function to be called by server actions
export async function suggestReconciliationMatches(input: ReconciliationInput): Promise<ReconciliationOutput> {
  return reconciliationFlow(input);
}

// Define the prompt for the AI model
const prompt = ai.definePrompt({
  name: 'reconciliationPrompt',
  input: {schema: ReconciliationInputSchema},
  output: {schema: ReconciliationOutputSchema},
  prompt: `You are an expert accountant specializing in bank reconciliation for a logistics company.
  Your task is to analyze two lists of transactions: one from a bank statement and one from the company's internal system.
  You must identify and suggest matches between these two lists.

  - A match can be one-to-one, one-to-many, or many-to-one.
  - The total amount of matched bank transactions must equal the total amount of matched system transactions. Remember that credits in one list should generally match debits in the other (e.g., a customer payment is a credit on the bank statement and clears a debit-balance invoice in the system).
  - Match transactions based on similar amounts, dates (within a few days of each other), and descriptions.
  - Pay close attention to descriptions. "PILOT TRAVEL CTR" on the bank statement likely matches an expense for "Fuel - Pilot #123" in the system. "ACH DEPOSIT: GLOBL LOGIST" likely matches a payment for an invoice sent to "Global Logistics Inc.".

  For each match you find, provide the IDs of the corresponding bank and system transactions and a brief reason for your suggestion. Only return suggestions for which you have high confidence. If no confident matches are found, return an empty list of suggestions.

  Bank Transactions:
  {{#each bankTransactions}}
  - ID: {{id}}, Date: {{date}}, Description: {{description}}, Amount: {{amount}}, Type: {{type}}
  {{/each}}

  System Transactions:
  {{#each systemTransactions}}
  - ID: {{id}}, Date: {{date}}, Description: {{description}}, Amount: {{amount}}, Type: {{type}}
  {{/each}}
  `,
});

// Define the Genkit flow
const reconciliationFlow = ai.defineFlow(
  {
    name: 'reconciliationFlow',
    inputSchema: ReconciliationInputSchema,
    outputSchema: ReconciliationOutputSchema,
  },
  async (input:any) => {
    // Return an empty list if either input array is empty
    if (input.bankTransactions.length === 0 || input.systemTransactions.length === 0) {
      return { suggestions: [] };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
