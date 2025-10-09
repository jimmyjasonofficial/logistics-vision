"use client";

import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

export default function InvoiceActions() {
  const handlePrint = () => window.print();

  const handleDownload = () => {
    console.log("Download PDF clicked");
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" /> Print / Export
      </Button>
      <Button variant="outline" onClick={handleDownload}>
        <Download className="mr-2 h-4 w-4" /> Download PDF
      </Button>
    </div>
  );
}
