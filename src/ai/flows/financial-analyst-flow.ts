
/**
 * @fileOverview A financial analyst AI agent.
 *
 * - getFinancialAnalysis - A function that handles financial analysis queries.
 * - FinancialAnalystInput - The input type for the getFinancialAnalysis function.
 * - FinancialAnalystOutput - The return type for the getFinancialAnalysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getInvoices } from '@/services/invoice-service';
import { getExpenses } from '@/services/expense-service';
import { getCustomers } from '@/services/customer-service';
import { getTrips } from '@/services/trip-service';

export const FinancialAnalystInputSchema = z.object({
  query: z.string().describe('The natural language query from the user.'),
});
export type FinancialAnalystInput = z.infer<typeof FinancialAnalystInputSchema>;

export const FinancialAnalystOutputSchema = z.object({
  analysis: z.string().describe("The AI's analysis and response to the query."),
});
export type FinancialAnalystOutput = z.infer<typeof FinancialAnalystOutputSchema>;

// --- Tool Schemas ---
const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  company: z.string(),
});

const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  status: z.enum(['Paid', 'Unpaid', 'Overdue', 'Draft']),
  total: z.number(),
});

const TripSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  revenue: z.number(),
  distance: z.number(),
  origin: z.string(),
  destination: z.string(),
});

const ExpenseSchema = z.object({
    id: z.string(),
    tripId: z.string().optional().nullable(),
    amount: z.number(),
});

// --- Tools ---
const getCustomersTool = ai.defineTool(
  {
    name: 'getCustomers',
    description: 'Retrieves a list of all customers.',
    inputSchema: z.object({}),
    outputSchema: z.array(CustomerSchema),
  },
  async () => getCustomers()
);

const getInvoicesTool = ai.defineTool(
  {
    name: 'getInvoices',
    description: 'Retrieves invoices. Can be filtered by customer, start date, and end date.',
    inputSchema: z.object({
      customerId: z.string().optional().describe('The ID of the customer to filter by.'),
      startDate: z.string().optional().describe('The start date of the period in YYYY-MM-DD format.'),
      endDate: z.string().optional().describe('The end date of the period in YYYY-MM-DD format.'),
    }),
    outputSchema: z.array(InvoiceSchema),
  },
  async ({ customerId, startDate, endDate }) => {
    // Revenue is based on PAID invoices.
    const invoices = await getInvoices({ customerId, startDate, endDate });
    return invoices.filter(inv => inv.status === 'Paid');
  }
);

const getTripsTool = ai.defineTool(
  {
    name: 'getTrips',
    description: 'Retrieves a list of trips. Can be filtered by customer ID.',
     inputSchema: z.object({
      customerId: z.string().optional().describe('The ID of the customer to filter by.'),
    }),
    outputSchema: z.array(TripSchema),
  },
  async ({ customerId }) => getTrips({ customerId })
);

const getExpensesTool = ai.defineTool(
  {
    name: 'getExpenses',
    description: 'Retrieves expenses. Can be filtered by a specific trip ID.',
    inputSchema: z.object({
      tripId: z.string().optional().describe('The ID of the trip to filter expenses for.'),
    }),
    outputSchema: z.array(ExpenseSchema),
  },
  async ({ tripId }) => getExpenses({ tripId })
);

export async function getFinancialAnalysis(input: FinancialAnalystInput): Promise<FinancialAnalystOutput> {
  return financialAnalystFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialAnalystPrompt',
  input: { schema: FinancialAnalystInputSchema },
  system: `You are an expert financial analyst for a logistics company. Your role is to answer questions about the company's financial and operational performance.

To answer questions, you have been given a set of tools to access the company's database. You must use these tools to retrieve the data you need.

Available Tools:
- getCustomers: Retrieves a list of all customers.
- getTrips(customerId): Retrieves a list of trips. Can be filtered by a specific customer ID.
- getInvoices(customerId, startDate, endDate): Retrieves invoices. Can be filtered by customer ID and/or a date range. Revenue is calculated from PAID invoices.
- getExpenses(tripId): Retrieves expenses. Can be filtered by a specific trip ID.

Analyze the user's query to determine what information you need.
Devise a step-by-step plan to fetch and process the data using your tools.
You may need to make multiple tool calls to answer a single question. For example, to find the most profitable customer, you would:
1. Call 'getCustomers' to get all customers.
2. For each customer, call 'getInvoices' with their ID to find their total revenue from paid invoices.
3. For each customer, call 'getTrips' with their ID.
4. For each trip found, call 'getExpenses' with the trip ID to find associated costs.
5. Calculate the profit for each customer (Total Revenue - Total Expenses from all their trips).
6. Present the final, ranked list to the user.

Always provide clear, concise, and data-driven answers. When providing numbers, format them clearly (e.g., $1,234.56).

The user's query is: {{{query}}}`,
  tools: [getCustomersTool, getInvoicesTool, getTripsTool, getExpensesTool],
  output: {
    format: 'text',
    schema: z.string().describe("The AI's analysis and response to the query."),
  }
});

const financialAnalystFlow = ai.defineFlow(
  {
    name: 'financialAnalystFlow',
    inputSchema: FinancialAnalystInputSchema,
    outputSchema: FinancialAnalystOutputSchema,
  },
  async (input:any) => {
    const llmResponse = await prompt(input);

    return { analysis: llmResponse.text };
  }
);
