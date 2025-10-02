"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import type { Customer } from "@/services/customer-service";
import Link from "next/link";
import { DeactivateCustomerMenuItem } from "./deactivate-customer-menu-item";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { DeleteMenuItem } from "@/components/ui/DeleteButton";
import { deleteCustomerAction } from "./actions";

const getStatusVariant = (status: string) => {
  return status === "Active" ? "secondary" : "outline";
};

export function CustomerList({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete(id: string) {
    setLoading(true);
    const result = await deleteCustomerAction(id);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Customer Deleted",
        description: `The Customer has been successfully deleted.`,
      });
      setOpen(false);
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error Deleting Customer",
        description: result.error,
      });
    }
  }
  if (customers.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No customers found in the database.
        <br />
        Try running `npm run setup:admin` to seed sample data.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead className="hidden sm:table-cell">Company</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>
              <Link
                href={`/customers/${customer.id}`}
                className="font-medium text-primary hover:underline"
              >
                {customer.name}
              </Link>
              <div className="text-sm text-muted-foreground hidden md:inline ml-2">
                {customer.email}
              </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              {customer.company}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  getStatusVariant(customer.status) as "secondary" | "outline"
                }
              >
                {customer.status}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/customers/edit/${customer.id}`}>Edit</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/customers/${customer.id}`}>View Details</Link>
                  </DropdownMenuItem>
                  {customer.status === "Active" ? (
                    <DeactivateCustomerMenuItem
                      customerId={customer.id}
                      customerName={customer.company}
                    />
                  ) : (
                    <DropdownMenuItem disabled>Re-activate</DropdownMenuItem>
                  )}
                  <DeleteMenuItem
                    name={"Customer"}
                    handleDelete={() => handleDelete(customer?.id)}
                    setOpen={setOpen}
                    loading={loading}
                    open={open}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
