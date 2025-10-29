"use client";


// import Link from "next/link";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { MoreHorizontal } from "lucide-react";
// import { format } from "date-fns";
// import { useRouter } from "next/navigation";
// import { useToast } from "@/hooks/use-toast";
// import { useState } from "react";
// import { DeleteMenuItem } from "@/components/ui/DeleteButton";
// import { deletePayrollAction } from "./actions";

// type PayrollRunSummary = {
//   id: string;
//   payPeriodStart: string;
//   payPeriodEnd: string;
//   paymentDate: string;
//   status: "Paid" | "Draft" | "Approved";
//   employeesCount: number;
//   totalAmount: number;
// };

// type PayrollTableProps = {
//   payrollRuns: PayrollRunSummary[];
// };

// const getStatusVariant = (status: string) => {
//   switch (status) {
//     case "Paid":
//       return "secondary";
//     case "Approved":
//       return "default";
//     case "Draft":
//       return "outline";
//     default:
//       return "default";
//   }
// };

// export function PayrollTable({ payrollRuns }: PayrollTableProps) {
//   const router = useRouter();
//   const { toast } = useToast();
//   const [loading, setLoading] = useState(false);
//   const [open, setOpen] = useState(false);

//   // 🔹 handle delete payroll
//   async function handleDelete(id: string) {
//     setLoading(true);
//     const result = await deletePayrollAction(id);
//     console.log("🧾 Payroll Runs Data:", result);
//     setLoading(false);

//     if (result.success) {
//       toast({
//         title: "Payroll Deleted",
//         description: `The Payroll has been successfully deleted.`,
//       });
//       setOpen(false);
//       router.refresh();
//     } else {
//       toast({
//         variant: "destructive",
//         title: "Error Deleting Payroll",
//         description: result.error,
//       });
//     }
//   }

//   // 🔹 handle View Payslips (just log payroll data)
//   // const handleViewPayslips = (payroll: PayrollRunSummary) => {
//   //   console.log("👀 Viewing Payslips for Payroll:", payroll);
//   //   toast({
//   //     title: "Payslips Viewed",
//   //     description: `Payroll ID: ${payroll.id} — check console for details.`,
//   //   });
//   // };

//   // inside handleViewPayslips
//   const handleViewPayslips = (payroll: PayrollRunSummary) => {
//     console.log("👀 Viewing Payslips for Payroll:", payroll);
//     toast({
//       title: "Payslips Viewed",
//       description: `Payroll ID: ${payroll.id} — check console for details.`,
//     });
//     // redirect to payslip page with payroll id as param
//     // router.push(`/hr/payslip/${payroll.id}`);
//   };

//   if (payrollRuns.length === 0) {
//     return (
//       <div className="text-center p-8 text-muted-foreground">
//         No payroll runs found.
//       </div>
//     );
//   }

//   return (
//     <Table>
//       <TableHeader>
//         <TableRow>
//           <TableHead>Pay Period</TableHead>
//           <TableHead>Pay Date</TableHead>
//           <TableHead>Employees</TableHead>
//           <TableHead className="text-right">Total Gross Pay</TableHead>
//           <TableHead>Status</TableHead>
//           <TableHead>
//             <span className="sr-only">Actions</span>
//           </TableHead>
//         </TableRow>
//       </TableHeader>

//       <TableBody>
//         {payrollRuns.map((payroll) => (
//           <TableRow key={payroll.id}>
//             <TableCell className="font-medium">
//               <Link
//                 href={`/hr/payroll/${payroll.id}`}
//                 className="text-primary hover:underline"
//               >
//                 {format(new Date(payroll.payPeriodStart), "d MMM yyyy")} -{" "}
//                 {format(new Date(payroll.payPeriodEnd), "d MMM yyyy")}
//               </Link>
//             </TableCell>

//             <TableCell>
//               {format(new Date(payroll.paymentDate), "d MMM yyyy")}
//             </TableCell>
//             <TableCell>{payroll.employeesCount}</TableCell>
//             <TableCell className="text-right font-mono font-bold">
//               $
//               {payroll.totalAmount.toLocaleString("en-US", {
//                 minimumFractionDigits: 2,
//               })}
//             </TableCell>

//             <TableCell>
//               <Badge variant={getStatusVariant(payroll.status) as any}>
//                 {payroll.status}
//               </Badge>
//             </TableCell>

//             <TableCell>
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button aria-haspopup="true" size="icon" variant="ghost">
//                     <MoreHorizontal className="h-4 w-4" />
//                     <span className="sr-only">Toggle menu</span>
//                   </Button>
//                 </DropdownMenuTrigger>

//                 <DropdownMenuContent align="end">
//                   <DropdownMenuItem asChild>
//                     <Link href={`/hr/payroll/${payroll.id}`}>View/Edit</Link>
//                   </DropdownMenuItem>

//                   <DropdownMenuItem disabled={payroll.status !== "Draft"}>
//                     Finalize
//                   </DropdownMenuItem>

//                   {/* 👇 Logs payroll data in console */}

//                   <DropdownMenuItem onClick={() => downloadPDF(payroll)}>
//                     Download Payslip
//                   </DropdownMenuItem>


//                   <DeleteMenuItem
//                     name={"Payroll"}
//                     handleDelete={() => handleDelete(payroll?.id)}
//                     setOpen={setOpen}
//                     loading={loading}
//                     open={open}
//                   />
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </TableCell>
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>
//   );
// }




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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { DeleteMenuItem } from "@/components/ui/DeleteButton";
import { deletePayrollAction } from "./actions";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

type PayrollRunSummary = {
  id: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  paymentDate: string;
  status: "Paid" | "Draft" | "Approved";
  employeesCount: number;
  totalAmount: number;
};

type PayrollTableProps = {
  payrollRuns: PayrollRunSummary[];
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case "Paid":
      return "secondary";
    case "Approved":
      return "default";
    case "Draft":
      return "outline";
    default:
      return "default";
  }
};

// PDF Download Function
const downloadPDF = async (payroll: any) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { width, height } = page.getSize();
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let y = height - 50;

  try {
    // Using a placeholder for Laxmi logo - replace with your actual logo path
    const logoUrl = '/images/Logo.png'; // Adjust path as needed
    const logoResponse = await fetch(logoUrl);
    
    if (logoResponse.ok) {
      const logoImageBytes = await logoResponse.arrayBuffer();
      
      // Check if it's PNG or JPEG
      const isPng = logoUrl.toLowerCase().endsWith('.png');
      const logoImage = isPng 
        ? await pdfDoc.embedPng(logoImageBytes)
        : await pdfDoc.embedJpg(logoImageBytes);
      
      const logoDims = logoImage.scale(0.50); // Adjust scale as needed for your logo
      
      page.drawImage(logoImage, {
        x: 40,
        y: y - 40,
        width: logoDims.width,
        height: logoDims.height,
      });
    } else {
      // Fallback: Draw placeholder with Laxmi text
      page.drawRectangle({
        x: 50,
        y: y - 40,
        width: 80,
        height: 40,
        color: rgb(0.9, 0.9, 0.9),
      });
      page.drawText("LAXMI", {
        x: 60,
        y: y - 20,
        size: 10,
        font: fontBold,
        color: rgb(0.2, 0.2, 0.6),
      });
      page.drawText("LOGO", {
        x: 65,
        y: y - 35,
        size: 8,
        font: font,
        color: rgb(0.2, 0.2, 0.6),
      });
    }
  } catch (error) {
    console.log("Laxmi logo not available, using text placeholder");
  
  }

  // PAYSLIP Title
  page.drawText("PAYSLIP", {
      x: 50,
    y: y - 60,
    size: 18,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  // Employee Details (Left side)
  const employeeDetails = [
    "Brandon Eugen Narib 94050200155",
    "PO Box 2301",
    "WALVIS BAY ERONGO",
    "NAMIBIA"
  ];
  
  let employeeY = y - 80;
  employeeDetails.forEach((line, index) => {
    page.drawText(line, {
      x: 50,
      y: employeeY - (index * 14),
      size: 10,
      font: font,
    });
  });

  // Pay Details (Right side)
  const payDetails = [
    { label: "Pay Day", value: "7 Feb 2025" },
    { label: "Pay Period", value: "1 Jan 2025 to 31 Jan 2025" },
    { label: "Employee Tax Number", value: "INF NB 0013 Load Master" },
  ];

  let payDetailsY = y - 60;
  payDetails.forEach((item, index) => {
    page.drawText(item.label, {
      x: width - 300,
      y: payDetailsY - (index * 25),
      size: 9,
      font: fontBold,
    });
    page.drawText(item.value, {
      x: width - 300,
      y: payDetailsY - 14 - (index * 25),
      size: 9,
      font: font,
    });
  });

  // Company Address (Right side, below pay details)
  const companyAddress = [
    "INFINITY LOGISTICS CC",
    "1st FLOOR,UNIT 104,",
    "BAHNHOF STREET",
    "TRANSNAMIB,BUILDING",
    "+264 81 435 7034",
    "PO Box 29111",
    "WINDHOEK 9000",
    "NAMIBIA",
    "VAT Reg no: ",
    "10251490"
  ];

  let companyY = payDetailsY;
  companyAddress.forEach((line, index) => {
    page.drawText(line, {
      x: width - 150,
      y: companyY - (index * 12),
      size: 8,
      font: index === 0 ? fontBold : font,
    });
  });

// Earnings Section
let earningsY = companyY - 120;
page.drawText("Earnings", {
  x: 50,
  y: earningsY,
  size: 12,
  font: fontBold,
});
page.drawText("Amount NAD", {
  x: width - 350,
  y: earningsY,
  size: 10,
  font: fontBold,
});

// Draw border under Earnings and Amount NAD headers
page.drawLine({
  start: { x: 50, y: earningsY - 8 },
  end: { x: width - 350 + 100, y: earningsY - 8 }, // Extend to amount column width
  thickness: 0.2,
  color: rgb(0, 0, 0),
});

const earnings = [
  { description: "Basic Salaries (1.00 @ 20800.00)", amount: "20,800.00" },
  { description: "Over Time (1.00 @ 5100.00)", amount: "5,100.00" },
  { description: "Back Pay (1.00 @ 4000.00)", amount: "4,000.00" },
  { description: "INFINITY CONTRIBUTION PRIME", amount: "1,200.00" },
];

let earningsListY = earningsY - 30;

// Draw earnings items with borders
earnings.forEach((item, index) => {
  page.drawText(item.description, {
    x: 50,
    y: earningsListY - (index * 20),
    size: 9,
    font: font,
  });
  
  page.drawText(item.amount, {
    x: width - 350,
    y: earningsListY - (index * 20),
    size: 9,
    font: font,
  });
  
  // Draw bottom border for each earnings item
  page.drawLine({
    start: { x: 50, y: earningsListY - (index * 20) - 8 },
    end: { x: width - 350 + 100, y: earningsListY - (index * 20) - 8 }, // Extend to amount column width
    thickness: 0.2,
    color: rgb(0, 0, 0),
  });
});

// Total Earnings with top border
const totalEarningsY = earningsListY - (earnings.length * 20) - 10;

// Draw top border for Total Earnings
// page.drawLine({
//   start: { x: 50, y: totalEarningsY + 15 },
//   end: { x: width - 350 + 100, y: totalEarningsY + 15 }, // Extend to amount column width
//   thickness: 1,
//   color: rgb(0, 0, 0),
// });

page.drawText("Total Earnings", {
  x: 50,
  y: totalEarningsY,
  size: 10,
  font: fontBold,
});
page.drawText("31,100.00", {
  x: width - 350,
  y: totalEarningsY,
  size: 10,
  font: fontBold,
});

// Draw bottom border for Total Earnings
page.drawLine({
  start: { x: 50, y: totalEarningsY - 8 },
  end: { x: width - 350 + 100, y: totalEarningsY - 8 }, // Extend to amount column width
  thickness: 1,
  color: rgb(0, 0, 0),
});

// Deductions Section
let deductionsY = totalEarningsY - 40;
page.drawText("Deductions", {
  x: 50,
  y: deductionsY,
  size: 12,
  font: fontBold,
});

page.drawText("Amount NAD", {
  x: width - 350,
  y: deductionsY,
  size: 10,
  font: fontBold,
});

// Draw border under Deductions and Amount NAD headers
page.drawLine({
  start: { x: 50, y: deductionsY - 8 },
  end: { x: width - 350 + 100, y: deductionsY - 8 }, // Extend to amount column width
  thickness: 0.2,
  color: rgb(0, 0, 0),
});

const deductions = [
  { description: "Deductions", amount: "5,300.00" },
  { description: "EMPLOYEE PRIME PROTECTOR", amount: "1,200.00" },
  { description: "SSC Employee", amount: "40.10" },
  { description: "Payroll Tax", amount: "417.00" },
];

let deductionsListY = deductionsY - 30;

// Draw deductions items with borders
deductions.forEach((item, index) => {
  page.drawText(item.description, {
    x: 50,
    y: deductionsListY - (index * 20),
    size: 9,
    font: font,
  });
  page.drawText(item.amount, {
    x: width - 350,
    y: deductionsListY - (index * 20),
    size: 9,
    font: font,
  });
  
  // Draw bottom border for each deductions item
  page.drawLine({
    start: { x: 50, y: deductionsListY - (index * 20) - 8 },
    end: { x: width - 350 + 100, y: deductionsListY - (index * 20) - 8 }, // Extend to amount column width
    thickness: 0.2,
    color: rgb(0, 0, 0),
  });
});

// Total Deductions with top border
const totalDeductionsY = deductionsListY - (deductions.length * 20) - 10;

// Draw top border for Total Deductions
// page.drawLine({
//   start: { x: 50, y: totalDeductionsY + 15 },
//   end: { x: width - 350 + 100, y: totalDeductionsY + 15 }, // Extend to amount column width
//   thickness: 1,
//   color: rgb(0, 0, 0),
// });

page.drawText("Total Deductions", {
  x: 50,
  y: totalDeductionsY,
  size: 10,
  font: fontBold,
});
page.drawText("6,957.10", {
  x: width - 350,
  y: totalDeductionsY,
  size: 10,
  font: fontBold,
});

// Draw bottom border for Total Deductions
// page.drawLine({
//   start: { x: 50, y: totalDeductionsY - 8 },
//   end: { x: width - 350 + 100, y: totalDeductionsY - 8 }, // Extend to amount column width
//   thickness: 1,
//   color: rgb(0, 0, 0),
// });

// Take Home Pay with borders
const takeHomeY = totalDeductionsY - 30;

// Draw top border for Take Home Pay
page.drawLine({
  start: { x: 50, y: takeHomeY + 15 },
  end: { x: width - 350 + 100, y: takeHomeY + 15 }, // Extend to amount column width
  thickness: 1,
  color: rgb(0, 0, 0),
});

page.drawText("Take Home Pay", {
  x: 50,
  y: takeHomeY,
  size: 12,
  font: fontBold,
});
page.drawText("24,142.90", {
  x: width - 350,
  y: takeHomeY,
  size: 12,
  font: fontBold,
});

// Draw bottom border for Take Home Pay
// page.drawLine({
//   start: { x: 50, y: takeHomeY - 8 },
//   end: { x: width - 350 + 100, y: takeHomeY - 8 }, // Extend to amount column width
//   thickness: 1,
//   color: rgb(0, 0, 0),
// });

// SSC at bottom with borders
const sscY = takeHomeY - 30;

// Draw top border for SSC
page.drawLine({
  start: { x: 50, y: sscY + 15 },
  end: { x: width - 350 + 100, y: sscY + 15 }, // Extend to amount column width
  thickness: 0.2,
  color: rgb(0, 0, 0),
});

page.drawText("SSC", {
  x: 50,
  y: sscY,
  size: 9,
  font: font,
});
page.drawText("40.10", {
  x: width - 350,
  y: sscY,
  size: 9,
  font: font,
});

// Draw bottom border for SSC
page.drawLine({
  start: { x: 50, y: sscY - 8 },
  end: { x: width - 350 + 100, y: sscY - 8 }, // Extend to amount column width
  thickness: 0.2,
  color: rgb(0, 0, 0),
});

  // Save and download PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `payslip-${payroll.id}.pdf`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export function PayrollTable({ payrollRuns }: PayrollTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // 🔹 handle delete payroll
  async function handleDelete(id: string) {
    setLoading(true);
    const result = await deletePayrollAction(id);
    console.log("🧾 Payroll Runs Data:", result);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Payroll Deleted",
        description: `The Payroll has been successfully deleted.`,
      });
      setOpen(false);
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Error Deleting Payroll",
        description: result.error,
      });
    }
  }

  // 🔹 handle Download Payslip
  const handleDownloadPayslip = async (payroll: PayrollRunSummary) => {
    try {
      setLoading(true);
      await downloadPDF(payroll);
      toast({
        title: "Payslip Downloaded",
        description: `Payslip for ${payroll.id} has been downloaded successfully.`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download payslip. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (payrollRuns.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No payroll runs found.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pay Period</TableHead>
          <TableHead>Pay Date</TableHead>
          <TableHead>Employees</TableHead>
          <TableHead className="text-right">Total Gross Pay</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {payrollRuns.map((payroll) => (
          <TableRow key={payroll.id}>
            <TableCell className="font-medium">
              <Link
                href={`/hr/payroll/${payroll.id}`}
                className="text-primary hover:underline"
              >
                {format(new Date(payroll.payPeriodStart), "d MMM yyyy")} -{" "}
                {format(new Date(payroll.payPeriodEnd), "d MMM yyyy")}
              </Link>
            </TableCell>

            <TableCell>
              {format(new Date(payroll.paymentDate), "d MMM yyyy")}
            </TableCell>
            <TableCell>{payroll.employeesCount}</TableCell>
            <TableCell className="text-right font-mono font-bold">
              $
              {payroll.totalAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </TableCell>

            <TableCell>
              <Badge variant={getStatusVariant(payroll.status) as any}>
                {payroll.status}
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
                  <DropdownMenuItem asChild>
                    <Link href={`/hr/payroll/${payroll.id}`}>View/Edit</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem disabled={payroll.status !== "Draft"}>
                    Finalize
                  </DropdownMenuItem>

                  {/* Download Payslip Option */}
                  <DropdownMenuItem 
                    onClick={() => handleDownloadPayslip(payroll)}
                    disabled={loading}
                  >
                    {loading ? "Downloading..." : "View Payslip"}
                  </DropdownMenuItem>

                  <DeleteMenuItem
                    name={"Payroll"}
                    handleDelete={() => handleDelete(payroll?.id)}
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