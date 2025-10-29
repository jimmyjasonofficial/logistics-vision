"use client";

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface InvoiceData {
  id: string;
  customer: string;
  dateIssued: string;
  dueDate: string;
  status: string;
  subtotal: number;
  totalTax: number;
  total: number;
  reference: string;
  lineItems: Array<{
    item: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

interface DownloadWithDataProps {
  invoiceData: InvoiceData;
}

export default function DownloadWithData({ invoiceData }: DownloadWithDataProps) {
  const handleDownloadWithData = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const black = rgb(0, 0, 0);
      const darkGray = rgb(0.3, 0.3, 0.3);
      const greenColor = rgb(0, 0.5, 0);

      const pageWidth = page.getWidth();
      const pageHeight = page.getHeight();

      // ====== LOGO ======
      try {
        const logoResponse = await fetch("/images/Logo.png");
        if (logoResponse.ok) {
          const logoImageBytes = await logoResponse.arrayBuffer();
          const logoImage = await pdfDoc.embedPng(logoImageBytes);
          const logoDims = logoImage.scale(0.4);
          page.drawImage(logoImage, {
            x: 40,
            y: pageHeight - 80,
            width: logoDims.width,
            height: logoDims.height,
          });
        }
      } catch {
        console.log("Logo not found, continuing without logo");
      }

      // ====== HEADER ======
      page.drawText("TAX-INVOICE", {
        x: 50,
        y: pageHeight - 110,
        size: 16,
        font: boldFont,
        color: black,
      });

      page.drawText("Ab-Inber Namibia (Pty) Ltd", {
        x: 50,
        y: pageHeight - 125,
        size: 10,
        font: boldFont,
        color: black,
      });
      page.drawText("Attention: P.O Box 23055", {
        x: 50,
        y: pageHeight - 140,
        size: 9,
        font,
        color: black,
      });
      page.drawText("WINDHOEK KHOMAS 9000", {
        x: 50,
        y: pageHeight - 155,
        size: 9,
        font,
        color: black,
      });
      page.drawText("NAMIBIA", {
        x: 50,
        y: pageHeight - 170,
        size: 9,
        font,
        color: black,
      });

      // ====== RIGHT SIDE INFO ======
      const rightColumnX = pageWidth - 250;

      page.drawText("Invoice Date", {
        x: rightColumnX,
        y: pageHeight - 100,
        size: 9,
        font,
        color: darkGray,
      });
      page.drawText(invoiceData.dateIssued, {
        x: rightColumnX,
        y: pageHeight - 115,
        size: 9,
        font: boldFont,
        color: black,
      });

      page.drawText("Account Number", {
        x: rightColumnX,
        y: pageHeight - 130,
        size: 9,
        font,
        color: darkGray,
      });
      page.drawText("AB/001", {
        x: rightColumnX,
        y: pageHeight - 145,
        size: 9,
        font: boldFont,
        color: black,
      });

      page.drawText("Invoice Number", {
        x: rightColumnX,
        y: pageHeight - 160,
        size: 9,
        font,
        color: darkGray,
      });
      page.drawText(invoiceData.id, {
        x: rightColumnX,
        y: pageHeight - 175,
        size: 9,
        font: boldFont,
        color: black,
      });

      page.drawText("Reference", {
        x: rightColumnX,
        y: pageHeight - 190,
        size: 9,
        font,
        color: darkGray,
      });
      page.drawText(invoiceData.reference || "-", {
        x: rightColumnX,
        y: pageHeight - 205,
        size: 9,
        font: boldFont,
        color: black,
      });

      page.drawText("VAT Reg ncc", {
        x: rightColumnX,
        y: pageHeight - 220,
        size: 9,
        font,
        color: darkGray,
      });
      page.drawText("10251820", {
        x: rightColumnX,
        y: pageHeight - 235,
        size: 9,
        font: boldFont,
        color: black,
      });

      // ====== BILL TO ======
      const billToY = pageHeight - 100;
      page.drawText(invoiceData.customer.toUpperCase(), {
        x: 450,
        y: billToY,
        size: 11,
        font: boldFont,
        color: black,
      });

      const addressLines = [
        "14 FLOORLIMIT 104,",
        "BAHWEIP STREET",
        "TRANSHAIING BUILDING",
        "+284 81 435 7034",
        "P.O Box 29111",
        "WINDHOEK 9000",
        "NAMIBIA",
      ];
      addressLines.forEach((line, i) => {
        page.drawText(line, {
          x: 450,
          y: billToY - 20 - i * 15,
          size: 9,
          font,
          color: black,
        });
      });

      // ====== TABLE ======
      const tableTopY = billToY - 190;
      const headers = ["Item", "Description", "Quantity", "Unit Price", "Amount"];
      const headerPositions = [50, 120, 320, 400, 500];

      headers.forEach((header, i) => {
        page.drawText(header, {
          x: headerPositions[i],
          y: tableTopY,
          size: 8,
          font: boldFont,
          color: black,
        });
      });

      page.drawLine({
        start: { x: 45, y: tableTopY - 5 },
        end: { x: pageWidth - 45, y: tableTopY - 5 },
        thickness: 1,
        color: black,
      });

      let rowY = tableTopY - 25;
      invoiceData.lineItems.forEach((item) => {
        page.drawText(item.item, { x: 50, y: rowY, size: 8, font, color: black });
        page.drawText(item.description, { x: 120, y: rowY, size: 8, font, color: black });
        page.drawText(item.quantity.toString(), { x: 320, y: rowY, size: 8, font, color: black });
        page.drawText(item.unitPrice.toFixed(2), { x: 400, y: rowY, size: 8, font, color: black });
        page.drawText(
          (item.quantity * item.unitPrice).toFixed(2),
          { x: 500, y: rowY, size: 8, font: boldFont, color: black }
        );
        rowY -= 20;
      });

      // ====== TOTALS ======
      const totalsY = rowY - 30;
      const labelColumnX = 350;
      const amountColumnX = 550;
      const amountStartX = amountColumnX - 60;

      page.drawText("Subtotal", { x: labelColumnX + 60, y: totalsY, size: 9, font, color: black });
      page.drawText(invoiceData.subtotal.toFixed(2), { x: amountStartX, y: totalsY, size: 9, font: boldFont, color: black });

      page.drawText("TOTAL SALES VAT / TAX 15%", { x: labelColumnX, y: totalsY - 15, size: 9, font, color: black });
      page.drawText(invoiceData.totalTax.toFixed(2), { x: amountStartX, y: totalsY - 15, size: 9, font: boldFont, color: black });

      page.drawLine({
        start: { x: labelColumnX, y: totalsY - 25 },
        end: { x: amountColumnX, y: totalsY - 25 },
        thickness: 1,
        color: black,
      });

      page.drawText("TOTAL NAD", { x: labelColumnX + 35, y: totalsY - 40, size: 11, font: boldFont, color: black });
      page.drawText(invoiceData.total.toFixed(2), { x: amountStartX, y: totalsY - 40, size: 11, font: boldFont, color: black });

      // ====== DUE DATE + BANK DETAILS ======
      const bottomSectionY = totalsY - 80;
      page.drawText(`Due Date: ${invoiceData.dueDate}`, {
        x: 50,
        y: bottomSectionY,
        size: 10,
        font: boldFont,
        color: black,
      });

      const bankDetails = [
        "FIRB NAMIBIA",
        "ACCOUNT NAME: INFINITY LOGISTICS CC",
        "ACCOUNT NUMBER: 50272992919",
        "BRANCH: AUZEPANPAYAT",
        "BRANCH CODE: 25672",
        "",
        "STANDARD BANK",
        "ACCOUNT NAME: INFINITY LOGISTICS CC",
        "ACCOUNT NUMBER: 5030388058",
        "BRANCH: KULTUTURA",
        "BRANCH CODE: 50573",
        "SWIFT CODE: 581864400X",
      ];
      bankDetails.forEach((line, i) => {
        page.drawText(line, {
          x: 50,
          y: bottomSectionY - 25 - i * 12,
          size: 8,
          font: line.includes("BANK") ? boldFont : font,
          color: black,
        });
      });

      const clickableText = "View and pay online now";
      const clickableTextY = bottomSectionY - 25 - bankDetails.length * 12 - 20;
      page.drawText(clickableText, { x: 50, y: clickableTextY, size: 10, font: boldFont, color: greenColor });
      page.drawLine({
        start: { x: 50, y: clickableTextY - 2 },
        end: { x: 50 + font.widthOfTextAtSize(clickableText, 10), y: clickableTextY - 2 },
        thickness: 1,
        color: greenColor,
      });

      page.drawText(
        "Company Registration No. CC201903064. Registration Office: P.O Box 29111; Kujugaku street, Northern Industrial, Windhoek, Unit 27 Balbo park, Windhoek, 9000, Namibia.",
        { x: 30, y: 30, size: 7, font, color: darkGray }
      );

      // ====== DOWNLOAD ======
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `TAX-INVOICE_${invoiceData.id}.pdf`;
      link.click();
    } catch (err) {
      console.error("Error generating PDF:", err);
    }
  };

  return (
    <Button onClick={handleDownloadWithData} variant="secondary" className="text-white">
      <Download className="mr-2 h-4 w-4" /> Download Attachment
    </Button>
  );
}
