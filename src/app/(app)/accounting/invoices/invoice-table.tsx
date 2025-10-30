import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import type { Invoice } from "@/services/invoice-service";
import { DeleteInvoiceMenuItem } from "./delete-invoice-menu-item";
import { MarkAsPaidMenuItem } from "./mark-as-paid-menu-item";

type InvoiceTableProps = {
  invoices: Invoice[];
  onSelectionChange?: (selected: Invoice[]) => void;
};

const getStatusVariant = (status: Invoice["status"]) => {
  switch (status) {
    case "Paid": return "secondary";
    case "Unpaid": return "default";
    case "Overdue": return "destructive";
    case "Draft": return "outline";
    default: return "default";
  }
};

export function InvoiceTable({ invoices, onSelectionChange }: InvoiceTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (invoiceId: string) => {
    const newSelection = selectedIds.includes(invoiceId)
      ? selectedIds.filter((id) => id !== invoiceId)
      : [...selectedIds, invoiceId];
    setSelectedIds(newSelection);
    onSelectionChange?.(invoices.filter((i) => newSelection.includes(i.id)));
  };

  const toggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSelection = e.target.checked ? invoices.map((i) => i.id) : [];
    setSelectedIds(newSelection);
    onSelectionChange?.(invoices.filter((i) => newSelection.includes(i.id)));
  };

  if (invoices.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No invoices found for this category.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <input
              type="checkbox"
              checked={selectedIds.length === invoices.length}
              onChange={toggleAll}
              className="h-4 w-4 cursor-pointer rounded-lg border-gray-300 accent-[#ff5900]"
            />
          </TableHead>
          <TableHead>Invoice #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Issued</TableHead>
          <TableHead>Due</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead><span className="sr-only">Actions</span></TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell>
              <input
                type="checkbox"
                checked={selectedIds.includes(invoice.id)}
                onChange={() => toggleSelect(invoice.id)}
                className="h-4 w-4 cursor-pointer rounded-lg border-gray-300 accent-[#ff5900]"
              />
            </TableCell>
            <TableCell className="font-medium">
              <Link href={`/accounting/invoices/${invoice.id}`} className="text-primary hover:underline">
                {invoice.id}
              </Link>
            </TableCell>
            <TableCell>{invoice.customer}</TableCell>
            <TableCell>{invoice.dateIssued}</TableCell>
            <TableCell>{invoice.dueDate}</TableCell>
            <TableCell className="text-right">
              N${invoice.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/accounting/invoices/${invoice.id}`}>View Details</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/accounting/invoices/edit/${invoice.id}`}>Edit</Link>
                  </DropdownMenuItem>
                  <MarkAsPaidMenuItem invoiceId={invoice.id} invoiceStatus={invoice.status} />
                  <DeleteInvoiceMenuItem invoiceId={invoice.id} />
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
