"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceTable } from "./invoice-table";
import { useEffect, useState } from "react";
import { getInvoices, type Invoice } from "@/services/invoice-service";
import InvoiceModal from "./new/InvoiceModal";

export default function InvoicesPage() {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<Invoice[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const searchParams = useSearchParams();
  const [defaultTab, setDefaultTab] = useState("all");

  const statusParam = searchParams.get("status")?.toLowerCase();

  /* ---------------- Fetch invoices ---------------- */
  useEffect(() => {
    async function fetchData() {
      const data = await getInvoices();
      setInvoices(data);
    }
    fetchData();
  }, []);

  /* ---------------- Handle tab default ---------------- */
  useEffect(() => {
    if (statusParam === "draft") setDefaultTab("draft");
    else if (statusParam === "paid") setDefaultTab("paid");
    else if (statusParam === "unpaid") setDefaultTab("unpaid");
    else if (statusParam === "overdue") setDefaultTab("overdue");
    else setDefaultTab("all");
  }, [statusParam]);

  /* ---------------- Filtered data ---------------- */
  const paidInvoices = invoices.filter((i) => i.status === "Paid");
  const unpaidInvoices = invoices.filter((i) => i.status === "Unpaid");
  const overdueInvoices = invoices.filter((i) => i.status === "Overdue");
  const draftInvoices = invoices.filter((i) => i.status === "Draft");

  /* ---------------- Bulk allocate ---------------- */
  const handleBulkAllocate = () => {
    if (selectedInvoices.length === 0) {
      alert("Please select at least one invoice before allocating payment.");
      return;
    }
    setShowInvoiceModal(true);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="flex-1 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">
              Manage your customer invoices here.
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center gap-x-4">
          <Button
            variant="secondary"
            className="text-white"
            onClick={handleBulkAllocate}
          >
            Allocate Bulk Payments
          </Button>

          <Button asChild>
            <Link href="/accounting/invoices/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} key={defaultTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        {/* ALL */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>A list of all invoices.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <InvoiceTable
                invoices={invoices}
                onSelectionChange={setSelectedInvoices}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* DRAFT */}
        <TabsContent value="draft">
          <Card>
            <CardHeader>
              <CardTitle>Draft Invoices</CardTitle>
              <CardDescription>
                Invoices that have not been sent yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <InvoiceTable
                invoices={draftInvoices}
                onSelectionChange={setSelectedInvoices}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* UNPAID */}
        <TabsContent value="unpaid">
          <Card>
            <CardHeader>
              <CardTitle>Unpaid Invoices</CardTitle>
              <CardDescription>Invoices awaiting payment.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <InvoiceTable
                invoices={unpaidInvoices}
                onSelectionChange={setSelectedInvoices}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAID */}
        <TabsContent value="paid">
          <Card>
            <CardHeader>
              <CardTitle>Paid Invoices</CardTitle>
              <CardDescription>
                Invoices that have been successfully paid.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <InvoiceTable
                invoices={paidInvoices}
                onSelectionChange={setSelectedInvoices}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* OVERDUE */}
        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Invoices</CardTitle>
              <CardDescription>
                Invoices that are past their due date.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <InvoiceTable
                invoices={overdueInvoices}
                onSelectionChange={setSelectedInvoices}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL */}
      <InvoiceModal
        open={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        selectedInvoices={selectedInvoices}
      />
    </div>
  );
}
