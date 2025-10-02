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
import type { LeaveRequest } from "@/services/leave-service";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { DeleteMenuItem } from "@/components/ui/DeleteButton";
import { deleteLeaveAction } from "./actions";

type LeaveTableProps = {
  requests: LeaveRequest[];
  actionLoading: boolean;
  onApprove?: (request: LeaveRequest) => void;
  onReject?: (request: LeaveRequest) => void;
};

const getStatusVariant = (status: LeaveRequest["status"]) => {
  switch (status) {
    case "Approved":
      return "secondary";
    case "Pending":
      return "outline";
    case "Rejected":
      return "destructive";
    default:
      return "default";
  }
};

export function LeaveTable({
  requests,
  actionLoading,
  onApprove,
  onReject,
}: LeaveTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete(id: string) {
    setLoading(true);
    const result = await deleteLeaveAction(id);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Leave Deleted",
        description: `The Leave has been successfully deleted.`,
      });
      setOpen(false);
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error Deleting Leave",
        description: result.error,
      });
    }
  }
  if (requests.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No leave requests found for this category.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell className="font-medium">{request.employee}</TableCell>
            <TableCell>{request.startDate}</TableCell>
            <TableCell>{request.endDate}</TableCell>
            <TableCell>{request.reason}</TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(request.status)}>
                {request.status}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-haspopup="true"
                    size="icon"
                    variant="ghost"
                    disabled={actionLoading}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  {request.status === "Pending" && onApprove && (
                    <DropdownMenuItem onClick={() => onApprove(request)}>
                      Approve
                    </DropdownMenuItem>
                  )}
                  {request.status === "Pending" && onReject && (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                      onClick={() => onReject(request)}
                    >
                      Reject
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DeleteMenuItem
                    name={"Leave"}
                    handleDelete={() => handleDelete(request?.id)}
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
