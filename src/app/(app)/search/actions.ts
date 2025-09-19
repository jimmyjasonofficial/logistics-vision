
'use server';

import { getCustomers } from '@/services/customer-service';
import { getTrips } from '@/services/trip-service';
import { getInvoices } from '@/services/invoice-service';
import { getExpenses } from '@/services/expense-service';
import { unstable_noStore } from 'next/cache';

export type SearchResult = {
  type: 'Customer' | 'Trip' | 'Invoice' | 'Expense' | 'Page';
  id: string;
  title: string;
  description: string;
  url: string;
};

// Helper function to highlight matches
const highlight = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-primary/20 font-semibold rounded-sm px-0.5">$1</mark>');
}

const searchablePages: (Omit<SearchResult, 'description'> & {description: string, keywords: string})[] = [
    { type: 'Page', id: 'dashboard', title: 'Dashboard', description: 'Main overview of your logistics operations.', keywords: 'home main overview', url: '/dashboard' },
    { type: 'Page', id: 'trips', title: 'Trip Management', description: 'Oversee and manage all ongoing and completed trips.', keywords: 'trips loads freight', url: '/trips' },
    { type: 'Page', id: 'trips-planner', title: 'AI Route Planner', description: 'Get an optimized route for your truck shipments.', keywords: 'ai plan route optimizer', url: '/trips/planner' },
    { type: 'Page', id: 'customers', title: 'Customers', description: 'Manage your customers and their contact information.', keywords: 'clients contacts', url: '/customers' },
    { type: 'Page', id: 'invoices', title: 'Invoices', description: 'Manage your customer invoices.', keywords: 'billing accounting finance', url: '/accounting/invoices' },
    { type: 'Page', id: 'quotes', title: 'Quotes', description: 'Create and manage customer quotes.', keywords: 'estimates pricing', url: '/accounting/quotes' },
    { type: 'Page', id: 'expenses', title: 'Expenses', description: 'Track and manage all business expenses.', keywords: 'spending costs', url: '/accounting/expenses' },
    { type: 'Page', id: 'pnl', title: 'Profit & Loss', description: 'Analyze your company\'s financial performance.', keywords: 'p&l reports finance', url: '/accounting/pnl' },
    { type: 'Page', id: 'reconciliation', title: 'Bank Reconciliation', description: 'Match your bank statement with your system records.', keywords: 'banking accounts', url: '/accounting/reconciliation' },
    { type: 'Page', id: 'drivers', title: 'Drivers', description: 'Manage your driver records and performance.', keywords: 'employees staff fleet', url: '/fleet/drivers' },
    { type: 'Page', id: 'vehicles', title: 'Vehicles', description: 'Manage your vehicle fleet.', keywords: 'trucks assets fleet', url: '/fleet/vehicles' },
    { type: 'Page', id: 'maintenance', title: 'AI Maintenance', description: 'Get AI-powered maintenance recommendations.', keywords: 'mechanic repairs', url: '/ai-maintenance' },
    { type: 'Page', id: 'admin-roles', title: 'Roles & Permissions', description: 'Manage user roles and system access.', keywords: 'users security admin', url: '/admin/roles' },
    { type: 'Page', id: 'admin-settings', title: 'Application Settings', description: 'Configure general application settings.', keywords: 'configuration options admin', url: '/admin/settings' },
];

export async function searchAction(query: string): Promise<SearchResult[]> {
  unstable_noStore(); // <-- important
  const lowerCaseQuery = query.toLowerCase();
  
  const [customers, trips, invoices, expenses] = await Promise.all([
    getCustomers(),
    getTrips(),
    getInvoices(),
    getExpenses()
  ]);

  const dataResults: SearchResult[] = [];

  // Search Pages
  const pageResults: SearchResult[] = searchablePages
    .filter(page => 
        page.title.toLowerCase().includes(lowerCaseQuery) ||
        page.description.toLowerCase().includes(lowerCaseQuery) ||
        page.keywords.toLowerCase().includes(lowerCaseQuery)
    )
    .map(page => ({
        ...page,
        title: highlight(page.title, query),
        description: highlight(page.description, query),
    }));


  // Search Customers
  customers.forEach(customer => {
    if (
      customer.name.toLowerCase().includes(lowerCaseQuery) ||
      customer.company.toLowerCase().includes(lowerCaseQuery) ||
      customer.email.toLowerCase().includes(lowerCaseQuery) ||
      customer.id.toLowerCase().includes(lowerCaseQuery)
    ) {
      dataResults.push({
        type: 'Customer',
        id: customer.id,
        title: customer.company,
        description: `Contact: ${highlight(customer.name, query)} (${highlight(customer.email, query)})`,
        url: `/customers/${customer.id}`
      });
    }
  });
  
  // Search Trips
  trips.forEach(trip => {
    if (
      trip.id.toLowerCase().includes(lowerCaseQuery) ||
      trip.origin.toLowerCase().includes(lowerCaseQuery) ||
      trip.destination.toLowerCase().includes(lowerCaseQuery)
    ) {
      dataResults.push({
        type: 'Trip',
        id: trip.id,
        title: `Trip #${trip.id}`,
        description: `Route: ${highlight(trip.origin, query)} to ${highlight(trip.destination, query)}. Status: ${trip.status}`,
        url: `/trips/${trip.id}`
      });
    }
  });

  // Search Invoices
  invoices.forEach(invoice => {
     if (
      invoice.id.toLowerCase().includes(lowerCaseQuery) ||
      invoice.customer.toLowerCase().includes(lowerCaseQuery)
    ) {
        dataResults.push({
            type: 'Invoice',
            id: invoice.id,
            title: `Invoice #${invoice.id}`,
            description: `To: ${highlight(invoice.customer, query)}. Amount: $${invoice.total.toFixed(2)}. Status: ${invoice.status}`,
            url: `/accounting/invoices/${invoice.id}`
        });
    }
  });

  // Search Expenses
  expenses.forEach(expense => {
      if (
          expense.id.toLowerCase().includes(lowerCaseQuery) ||
          expense.description.toLowerCase().includes(lowerCaseQuery) ||
          expense.category.toLowerCase().includes(lowerCaseQuery)
      ) {
          dataResults.push({
              type: 'Expense',
              id: expense.id,
              title: `Expense #${expense.id}`,
              description: `Description: ${highlight(expense.description, query)}. Amount: $${expense.amount.toFixed(2)}. Category: ${highlight(expense.category, query)}`,
              url: `/accounting/expenses/${expense.id}`
          });
      }
  });
  
  const allResults = [...pageResults, ...dataResults];

  // A simple relevance sort: matches in title/id are more important.
  allResults.sort((a, b) => {
    const aTitleMatch = a.title.toLowerCase().includes(lowerCaseQuery) ? -1 : 0;
    const bTitleMatch = b.title.toLowerCase().includes(lowerCaseQuery) ? -1 : 0;
    return aTitleMatch - bTitleMatch;
  });

  return allResults.slice(0, 50); // Limit results
}
