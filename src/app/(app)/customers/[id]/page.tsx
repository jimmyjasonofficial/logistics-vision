// app/customers/[id]/page.tsx

import { notFound } from "next/navigation";
import { getCustomerById } from "@/services/customer-service";
import { getInvoices } from "@/services/invoice-service";
import { getTrips } from "@/services/trip-service";
import CustomerDetailsClient from "./CustomerDetailsClient";

export default async function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const customer = await getCustomerById(id);
  if (!customer) notFound();

  const allInvoices = await getInvoices();
  const allTrips = await getTrips();

  const customerTrips = allTrips.filter((trip) => trip.customerId === customer.id);
  const customerInvoices = allInvoices.filter((invoice) => invoice.customer === customer.company);

  const lifetimeValue = customerInvoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + inv.total, 0);

  const outstandingBalance = customerInvoices
    .filter((inv) => inv.status === "Unpaid" || inv.status === "Overdue")
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalTrips = customerTrips.length;

  return (
    <CustomerDetailsClient
      customer={customer}
      driverTrips={customerTrips}
      customerInvoices={customerInvoices}
      lifetimeValue={lifetimeValue}
      outstandingBalance={outstandingBalance}
      totalTrips={totalTrips}
    />
  );
}
