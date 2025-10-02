"use client";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { Download, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Employee } from "@/services/employee-service";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { DeleteMenuItem } from "@/components/ui/DeleteButton";
import { deleteDriverAction } from "../../fleet/drivers/actions";

const getStatusVariant = (status: string) => {
  switch (status) {
    case "Active":
      return "secondary";
    case "On Leave":
      return "outline";
    case "Inactive":
      return "destructive";
    default:
      return "default";
  }
};

export function EmployeeList({ employees }: { employees: Employee[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete(id: string) {
    setLoading(true);
    const result = await deleteDriverAction(id);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Employee Deleted",
        description: `The Employee has been successfully deleted.`,
      });
      setOpen(false);
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error Deleting Employee",
        description: result.error,
      });
    }
  }

  if (employees.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No employees found.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>License</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={employee.profile_image}
                    alt={employee.name}
                  />
                  <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    href={`/hr/employees/${employee.id}`}
                    className="text-primary hover:underline"
                  >
                    {employee.name}
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    {employee.email}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>{employee.role}</TableCell>
            <TableCell>
              <Badge
                variant={
                  getStatusVariant(employee.status) as
                    | "default"
                    | "secondary"
                    | "outline"
                    | "destructive"
                }
              >
                {employee.status}
              </Badge>
            </TableCell>
            <TableCell>{employee.phone}</TableCell>
            <TableCell>
              {employee.license_file ? (
                <a
                  href={employee.license_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:underline"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </a>
              ) : (
                <span className="text-gray-400">No file</span>
              )}
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
                    <Link href={`/hr/employees/${employee.id}`}>
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/hr/employees/edit/${employee.id}`}>Edit</Link>
                  </DropdownMenuItem>
                  <DeleteMenuItem
                    name={"Employee"}
                    handleDelete={() => handleDelete(employee?.id)}
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
