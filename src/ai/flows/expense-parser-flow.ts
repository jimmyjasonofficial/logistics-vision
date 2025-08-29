/**
 * @fileOverview An AI agent for parsing expense receipts.
 *
 * - parseExpenseReceipt - A function that handles parsing a receipt image.
 * - ExpenseParserInput - The input type for the parseExpenseReceipt function.
 * - ExpenseParserOutput - The return type for the parseExpenseReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ExpenseParserInputSchema = z.object({
  receiptImageUri: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExpenseParserInput = z.infer<typeof ExpenseParserInputSchema>;

const validCategories = z.enum(['Fuel', 'Repairs', 'Maintenance', 'Tyres', 'Tolls', 'Admin', 'Food & Lodging', 'Salaries', 'Other']);

export const ExpenseParserOutputSchema = z.object({
  vendor: z.string().describe('The name of the vendor or store from the receipt.'),
  date: z.string().describe('The date of the transaction in YYYY-MM-DD format.'),
  amount: z.number().describe('The total amount of the transaction as a number.'),
  category: validCategories.describe('The suggested category for this expense based on the vendor and items.'),
});
export type ExpenseParserOutput = z.infer<typeof ExpenseParserOutputSchema>;

export async function parseExpenseReceipt(input: ExpenseParserInput): Promise<ExpenseParserOutput> {
  return expenseParserFlow(input);
}

const prompt = ai.definePrompt({
  name: 'expenseParserPrompt',
  input: {schema: ExpenseParserInputSchema},
  output: {schema: ExpenseParserOutputSchema},
  prompt: `You are an expert accountant that extracts information from receipts for expense reports.
  Analyze the following receipt image. Extract the vendor name, the total transaction amount, and the date.
  
  Based on the vendor and items, suggest the most appropriate expense category.
  The available categories are: ${validCategories.options.join(', ')}.
  
  Format the date as YYYY-MM-DD.

  Receipt: {{media url=receiptImageUri}}`,
});

const expenseParserFlow = ai.defineFlow(
  {
    name: 'expenseParserFlow',
    inputSchema: ExpenseParserInputSchema,
    outputSchema: ExpenseParserOutputSchema,
  },
  async (input:any) => {
    const {output} = await prompt(input);
    return output!;
  }
);
