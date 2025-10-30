// "use client";

// import { Button } from "@/components/ui/button";
// import { Printer, Download } from "lucide-react";
// import DownloadWithData from "../handleDownloadWithData";

// export default function InvoiceActions() {
//   const handlePrint = () => window.print();

//   const handleDownload = () => {
//     console.log("Download PDF clicked");
//   };

//   return (
//     <div className="flex items-center gap-2">
//       <Button variant="outline" onClick={handlePrint}>
//         <Printer className="mr-2 h-4 w-4" /> Print / Export
//       </Button>
//       <Button variant="outline">
//         <Download className="mr-2 h-4 w-4" /> Download PDF
//          <DownloadWithData quoteData={quote} />
//       </Button>
//     </div>
//   );
// }

"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import DownloadWithData from "../handleDownloadWithData";

interface InvoiceActionsProps {
  invoice: {
    id: string;
    customer: string;
    dateIssued: string;
    dueDate: string;
    status: string;
    subtotal: number;
    totalTax: number;
    total: number;
    reference?: string;
    lineItems: Array<{
      item: string;
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
  };
}

export default function InvoiceActions({ invoice }: InvoiceActionsProps) {
  const handlePrint = () => window.print();

  return (
    <div className="flex items-center gap-2">
      {/* Print / Export Button */}
      <Button variant="outline" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" /> Print / Export
      </Button>

      {/* PDF Download Button (uses real data) */}
      <DownloadWithData invoiceData={invoice} />
    </div>
  );
}
