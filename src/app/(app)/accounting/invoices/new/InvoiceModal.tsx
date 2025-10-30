"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Invoice } from "@/services/invoice-service";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function InvoiceModal({
  open,
  onClose,
  selectedInvoices = [],
}: {
  open: boolean;
  onClose: () => void;
  selectedInvoices: Invoice[];
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full rounded-xl p-0 overflow-hidden shadow-lg border border-border">
        <DialogHeader className="bg-muted/50 p-5 border-b">
          <DialogTitle className="text-xl font-semibold text-foreground">
            Allocate Bulk Payments
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Review and confirm the selected invoices before proceeding.
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {selectedInvoices.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-10">
              No invoices selected.
            </p>
          ) : (
            <ScrollArea className="max-h-[50vh] rounded-md border p-3">
              <div className="space-y-4">
                {selectedInvoices.map((inv, idx) => (
                  <div
                    key={inv.id}
                    className="bg-card p-4 rounded-lg border hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-lg text-foreground">
                          {inv.customer || "Unknown Customer"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Invoice #{inv.id}
                        </p>
                      </div>
                      <Badge variant={
                        inv.status === "Paid"
                          ? "secondary"
                          : inv.status === "Overdue"
                          ? "destructive"
                          : inv.status === "Draft"
                          ? "outline"
                          : "default"
                      }>
                        {inv.status}
                      </Badge>
                    </div>

                    <Separator className="my-3" />

                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">Issued:</span>{" "}
                        <span className="font-medium">{inv.dateIssued || "-"}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Due:</span>{" "}
                        <span className="font-medium">{inv.dueDate || "-"}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Total:</span>{" "}
                        <span className="font-medium text-primary">
                          ${inv.total.toLocaleString()}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Reference:</span>{" "}
                        <span className="font-medium">{inv.reference || "—"}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="bg-muted/50 px-5 py-4 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={selectedInvoices.length === 0}
            onClick={() => {
              console.log("Proceed to allocate:", selectedInvoices);
              onClose();
            }}
          >
            Confirm Payment Allocation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
