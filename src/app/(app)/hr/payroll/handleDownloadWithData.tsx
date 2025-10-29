// "use client";

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
// import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

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

// // PDF Download Function
// const downloadPDF = async (payroll: PayrollRunSummary) => {
//   try {
//     const pdfDoc = await PDFDocument.create();
//     const page = pdfDoc.addPage([595, 842]); // A4 size
//     const { width, height } = page.getSize();

//     const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
//     const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

//     let y = height - 40;

//     // Company Logo Placeholder
//     page.drawText("Company Logo Here", { 
//       x: 50, y, size: 14, font: fontBold, color: rgb(0.8, 0.4, 0) 
//     });
//     y -= 25;

//     // PAYSLIP Title
//     page.drawText("PAYSLIP", { 
//       x: 50, y, size: 20, font: fontBold, color: rgb(0, 0, 0) 
//     });
//     y -= 30;

//     // Employee Details (Left side)
//     const employeeDetails = [
//       "Brandon Eugen Narib 94050200155",
//       "PO Box 2301",
//       "WALVIS BAY ERONGO",
//       "NAMIBIA",
//       "",
//       "Employee Tax Number",
//       "INF NB 0013 Load Master"
//     ];

//     employeeDetails.forEach((line, index) => {
//       page.drawText(line, { 
//         x: 50, 
//         y: y - (index * 14), 
//         size: index === 0 || index === 5 ? 10 : 9, 
//         font: index === 0 || index === 5 ? fontBold : font, 
//         color: rgb(0, 0, 0) 
//       });
//     });

//     y -= 100;

//     // Pay Details (Right side)
//     const payDetails = [
//       { label: "Pay Day", value: payroll.paymentDate },
//       { label: "Pay Period", value: `${payroll.payPeriodStart} to ${payroll.payPeriodEnd}` }
//     ];

//     payDetails.forEach((detail, index) => {
//       page.drawText(detail.label, { 
//         x: width - 200, 
//         y: height - 100 - (index * 40), 
//         size: 9, 
//         font: fontBold, 
//         color: rgb(0, 0, 0) 
//       });
//       page.drawText(detail.value, { 
//         x: width - 200, 
//         y: height - 115 - (index * 40), 
//         size: 10, 
//         font: font, 
//         color: rgb(0, 0, 0) 
//       });
//     });

//     // Company Address Block (Right side)
//     const companyAddress = [
//       "INFINITY LOGISTICS CC",
//       "1st FLOOR,UNIT 104,",
//       "BAHNHOF STREET",
//       "TRANSNAMIB,BUILDING",
//       "+264 81 435 7034",
//       "PO Box 29111",
//       "WINDHOEK 9000",
//       "NAMIBIA",
//       "",
//       "VAT Reg no:",
//       "10251490"
//     ];

//     companyAddress.forEach((line, index) => {
//       const isBold = index === 0 || index === 9;
//       page.drawText(line, { 
//         x: width - 200, 
//         y: height - 200 - (index * 12), 
//         size: index === 0 ? 10 : 8, 
//         font: isBold ? fontBold : font, 
//         color: rgb(0, 0, 0) 
//       });
//     });

//     // Dummy amounts as per your image
//     const basicSalary = 20800;
//     const overtime = 5100;
//     const backPay = 4000;
//     const contribution = 1200;
//     const deductions = 5300;
//     const employeeProtector = 1200;
//     const ssc = 40.1;
//     const payrollTax = 417;

//     const totalEarnings = basicSalary + overtime + backPay + contribution;
//     const totalDeductions = deductions + employeeProtector + ssc + payrollTax;
//     const takeHome = totalEarnings - totalDeductions;

//     // Earnings Section
//     y = height - 350;
//     page.drawText("Earnings", { 
//       x: 50, y, size: 14, font: fontBold, color: rgb(0, 0, 0) 
//     });
//     y -= 25;

//     const earnings = [
//       { desc: "Basic Salaries (1.00 @ 20800.00)", amount: basicSalary },
//       { desc: "Over Time (1.00 @ 5100.00)", amount: overtime },
//       { desc: "Back Pay (1.00 @ 4000.00)", amount: backPay },
//       { desc: "INFINITY CONTRIBUTION PRIME PROTECTOR", amount: contribution },
//       { desc: "Total Earnings", amount: totalEarnings }
//     ];

//     earnings.forEach((item, index) => {
//       const isTotal = index === earnings.length - 1;
//       page.drawText(item.desc, { 
//         x: 50, 
//         y: y - (index * 20), 
//         size: isTotal ? 10 : 9, 
//         font: isTotal ? fontBold : font, 
//         color: rgb(0, 0, 0) 
//       });
//       page.drawText(item.amount.toFixed(2), { 
//         x: width - 100, 
//         y: y - (index * 20), 
//         size: isTotal ? 10 : 9, 
//         font: isTotal ? fontBold : font, 
//         color: rgb(0, 0, 0) 
//       });
//     });

//     // Deductions Section
//     y = height - 480;
//     page.drawText("Deductions", { 
//       x: 50, y, size: 14, font: fontBold, color: rgb(0, 0, 0) 
//     });
//     y -= 25;

//     page.drawText("Amount NAD", { 
//       x: width - 100, y, size: 9, font: fontBold, color: rgb(0, 0, 0) 
//     });
//     y -= 20;

//     const deductionsList = [
//       { desc: "Deductions", amount: deductions },
//       { desc: "EMPLOYEE PRIME PROTECTOR", amount: employeeProtector },
//       { desc: "SSC Employee", amount: ssc },
//       { desc: "Payroll Tax", amount: payrollTax },
//       { desc: "Total Deductions", amount: totalDeductions }
//     ];

//     deductionsList.forEach((item, index) => {
//       const isTotal = index === deductionsList.length - 1;
//       page.drawText(item.desc, { 
//         x: 50, 
//         y: y - (index * 20), 
//         size: isTotal ? 10 : 9, 
//         font: isTotal ? fontBold : font, 
//         color: rgb(0, 0, 0) 
//       });
//       page.drawText(item.amount.toFixed(2), { 
//         x: width - 100, 
//         y: y - (index * 20), 
//         size: isTotal ? 10 : 9, 
//         font: isTotal ? fontBold : font, 
//         color: rgb(0, 0, 0) 
//       });
//     });

//     // Take Home Pay
//     y = height - 620;
//     page.drawText("Take Home Pay", { 
//       x: 50, y, size: 14, font: fontBold, color: rgb(0, 0, 0) 
//     });
//     page.drawText(takeHome.toFixed(2), { 
//       x: width - 100, y, size: 14, font: fontBold, color: rgb(0, 0, 0) 
//     });

//     // SSC at bottom
//     y = height - 650;
//     page.drawText("SSC", { 
//       x: 50, y, size: 9, font: font, color: rgb(0, 0, 0) 
//     });
//     page.drawText(ssc.toFixed(2), { 
//       x: width - 100, y, size: 9, font: font, color: rgb(0, 0, 0) 
//     });

//     const pdfBytes = await pdfDoc.save();
//     const blob = new Blob([pdfBytes], { type: "application/pdf" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `${payroll.id}-payslip.pdf`;
//     link.click();
    
//     URL.revokeObjectURL(link.href);
    
//     return true;
//   } catch (error) {
//     console.error("Error generating PDF:", error);
//     throw new Error("Failed to download payslip");
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

//   // 🔹 handle Download Payslip
//   const handleDownloadPayslip = async (payroll: PayrollRunSummary) => {
//     try {
//       setLoading(true);
//       await downloadPDF(payroll);
//       toast({
//         title: "Payslip Downloaded",
//         description: `Payslip for ${payroll.id} has been downloaded successfully.`,
//       });
//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: "Download Failed",
//         description: "Failed to download payslip. Please try again.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔹 handle View Payslips
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

//                   {/* Download Payslip Option */}
//                   <DropdownMenuItem 
//                     onClick={() => handleDownloadPayslip(payroll)}
//                     disabled={loading}
//                   >
//                     {loading ? "Downloading..." : "Download Payslip"}
//                   </DropdownMenuItem>

//                   {/* View Payslips Option */}
//                   <DropdownMenuItem onClick={() => handleViewPayslips(payroll)}>
//                     View Payslips
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