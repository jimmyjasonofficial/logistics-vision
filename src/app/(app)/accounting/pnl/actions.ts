
'use server';

import {
  getFinancialAnalysis,
  FinancialAnalystInput,
  FinancialAnalystOutput,
} from '@/ai/flows/financial-analyst-flow';
import { getInvoices, type Invoice } from '@/services/invoice-service';
import { getExpenses, type Expense } from '@/services/expense-service';
import { getTrips, type Trip } from '@/services/trip-service';

export async function getFinancialAnalysisAction(
  input: FinancialAnalystInput
): Promise<FinancialAnalystOutput | { error: string }> {
  try {
    const result = await getFinancialAnalysis(input);
    return result;
  } catch (e: any) {
    console.error('AI financial analysis failed:', e);
    return { error: e.message || 'Failed to get analysis from AI.' };
  }
}


// New action to fetch all data for the P&L page
export type PnlData = {
    invoices: Invoice[];
    expenses: Expense[];
    trips: Trip[];
};

export async function getPnlDataAction(
    startDate: string,
    endDate: string
): Promise<PnlData | { error: string }> {
    try {
        const [invoiceData, expenseData, tripData] = await Promise.all([
            getInvoices({ startDate, endDate }),
            getExpenses({ startDate, endDate }),
            getTrips({ startDate, endDate })
        ]);
        return {
            invoices: invoiceData,
            expenses: expenseData,
            trips: tripData,
        };
    } catch (e: any) {
        console.error('Failed to fetch P&L data:', e);
        return { error: e.message || 'An unknown error occurred.' };
    }
}
