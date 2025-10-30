// DownloadWithData.tsx
"use client";

import React from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type LineItem = {
  account?: string;
  description?: string;
  discount?: number;
  item: string;
  quantity: number;
  taxRate?: string;
  unitPrice: number;
};

type QuoteData = {
  id: string;
  customerId?: string;
  customer: string;
  reference?: string;
  dateIssued?: string;
  expiryDate?: string;
  status?: string;
  subtotal?: number;
  totalTax?: number;
  total?: number;
  taxType?: string;
  hasAttachment?: boolean;
  attachmentUrl?: string;
  attachmentPath?: string;
  lineItems: LineItem[];
};

interface DownloadWithDataProps {
  invoiceData: QuoteData;
}

export default function DownloadWithData({ quoteData }: DownloadWithDataProps) {
  const handleDownloadWithData = async () => {
    try {
      // Create PDF doc and page (A4)
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 in points approx.
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Colors
      const black = rgb(0, 0, 0);
      const darkGray = rgb(0.35, 0.35, 0.35);
      const lightGray = rgb(0.92, 0.92, 0.92);

      const pageWidth = page.getWidth();
      const pageHeight = page.getHeight();

      try {
        const logoResponse = await fetch("https://custom3.mystagingserver.site/logistics/logo.png");
        if (logoResponse.ok) {
          const logoImageBytes = await logoResponse.arrayBuffer();
          const logoImage = await pdfDoc.embedPng(logoImageBytes);
          const logoDims = logoImage.scale(0.4);
          page.drawImage(logoImage, {
            x: 35,
            y: pageHeight - 80,
            width: logoDims.width,
            height: logoDims.height,
          });
        }
      } catch {
        console.log("Logo not found, continuing without logo");
      }

      // -------------------------
      // HEADER: "QUOTE" and left company info
      // -------------------------
      // Big QUOTE title (to match image)
      const quoteTitleX = 40;
      const quoteTitleY = pageHeight - 110;
      page.drawText("QUOTE", {
        x: quoteTitleX,
        y: quoteTitleY,
        size: 16,
        font: boldFont,
        color: black,
      });

      // Left company block under QUOTE (match image)
      const companyLeftX = 40;
      const companyLeftY = quoteTitleY - 15;
      const companyLines = [
        "Ab-Inbey Namibia (Pty) Ltd",
        "Attention: P.O Box 23055",
        "WINDHOEK KHOMAS 9000",
        "NAMIBIA",
      ];
      companyLines.forEach((line, idx) => {
        page.drawText(line, {
          x: companyLeftX,
          y: companyLeftY - idx * 12,
          size: 9,
          font: idx === 0 ? boldFont : font,
          color: black,
        });
      });

      // -------------------------
      // RIGHT TOP INFO (Date, Quote Number, Reference, VAT Reg no)
      // This block mirrors the uploaded image: aligned to right and stacked
      // We will position block so top aligns similar to image
      // -------------------------
      const rightBlockX = pageWidth - 260; // roughly matches image
      // Start 100px below top QUOTE, as requested earlier
      let rightY = pageHeight - 100; // tuned for visual match

      const smallLabelSize = 8.5;
      const smallValueSize = 9;

      // Date
      page.drawText("Date", {
        x: rightBlockX,
        y: rightY,
        size: smallLabelSize,
        font,
        color: darkGray,
      });
      page.drawText(quoteData.dateIssued || "-", {
        x: rightBlockX,
        y: rightY - 12,
        size: smallValueSize,
        font: boldFont,
        color: black,
      });

      // Quote Number
      page.drawText("Quote Number", {
        x: rightBlockX,
        y: rightY - 30,
        size: smallLabelSize,
        font,
        color: darkGray,
      });
      page.drawText(quoteData.id || "-", {
        x: rightBlockX,
        y: rightY - 42,
        size: smallValueSize,
        font: boldFont,
        color: black,
      });

      // Reference
      page.drawText("Reference", {
        x: rightBlockX,
        y: rightY - 62,
        size: smallLabelSize,
        font,
        color: darkGray,
      });
      page.drawText(quoteData.reference || "-", {
        x: rightBlockX,
        y: rightY - 74,
        size: smallValueSize,
        font: boldFont,
        color: black,
      });

      // VAT Reg no (match position in image)
      page.drawText("VAT Reg no:", {
        x: rightBlockX,
        y: rightY - 94,
        size: smallLabelSize,
        font,
        color: darkGray,
      });
      page.drawText("10251490", {
        x: rightBlockX,
        y: rightY - 106,
        size: smallValueSize,
        font: boldFont,
        color: black,
      });

      // Company address block on far right (like image)
      const rightCompanyX = pageWidth - 160; // more right
      const rightCompanyY = pageHeight - 100;
      const rightCompanyLines = [
        "INFINITY LOGISTICS CC",
        "1st FLOOR, UNIT 104,",
        "BAHNHOF STREET",
        "TRANSNAMIABUILDING",
        "+264 81 435 7034",
        "P.O Box 29111",
        "WINDHOEK 9000",
        "NAMIBIA",
      ];
      rightCompanyLines.forEach((line, idx) => {
        page.drawText(line, {
          x: rightCompanyX,
          y: rightCompanyY - idx * 11,
          size: idx === 0 ? 9 : 8,
          font: idx === 0 ? boldFont : font,
          color: black,
        });
      });

      // -------------------------
      // BILL TO (left side under header)
      // -------------------------
      const billToX = 40;
      const billToY = pageHeight - 200;
      page.drawText("Bill To:", {
        x: billToX,
        y: billToY,
        size: 9,
        font: boldFont,
        color: black,
      });
      page.drawText(quoteData.customer || "-", {
        x: billToX,
        y: billToY - 14,
        size: 10,
        font: boldFont,
        color: black,
      });

      // Example address lines under bill to (if you have real address fields, replace them)
      const billToAddr = [
        // If you store address in API, replace these with fields from quoteData
        "14 FLOORLIMIT 104,",
        "BAHWEIP STREET",
        "TRANSHAIING BUILDING",
        "+284 81 435 7034",
        "P.O Box 29111",
        "WINDHOEK 9000",
        "NAMIBIA",
      ];
      billToAddr.forEach((line, i) => {
        page.drawText(line, {
          x: billToX,
          y: billToY - 30 - i * 11,
          size: 8,
          font,
          color: darkGray,
        });
      });

      // -------------------------
      // TABLE: headers & rows (match style of image)
      // -------------------------
      const tableX = 40;
      const tableTopY = billToY - 140; // tuned for similarity
      const headers = [
        "Item",
        "Description",
        "Quantity",
        "Unit Price",
        "Tax",
        "Amount NAD",
      ];
      const colX = [tableX, 150, 300, 350, 400, 500];

      // Draw table header text
      headers.forEach((h, i) =>
        page.drawText(h, {
          x: colX[i],
          y: tableTopY,
          size: 8,
          font: boldFont,
          color: black,
        })
      );

      // Header bottom line
      page.drawLine({
        start: { x: tableX, y: tableTopY - 6 },
        end: { x: pageWidth - 40, y: tableTopY - 6 },
        thickness: 1,
        color: black,
      });

      // Draw line items rows
      let rowY = tableTopY - 20;
      quoteData.lineItems.forEach((li, idx) => {
        // Item code
        page.drawText(li.item || "-", {
          x: colX[0],
          y: rowY,
          size: 8,
          font: boldFont,
          color: black,
        });

        // Description (might be multi-line — naive wrapping)
        const desc = li.description || "-";
        page.drawText(desc, {
          x: colX[1],
          y: rowY,
          size: 8,
          font,
          color: darkGray,
        });

        // Quantity
        page.drawText(String(Number(li.quantity).toFixed(2)), {
          x: colX[2],
          y: rowY,
          size: 8,
          font,
          color: black,
        });

        // Unit Price
        page.drawText(Number(li.unitPrice).toFixed(2), {
          x: colX[3],
          y: rowY,
          size: 8,
          font,
          color: black,
        });

        // Tax rate
        const taxText = li.taxRate || quoteData.lineItems[0]?.taxRate || "15%";
        page.drawText(taxText, {
          x: colX[4],
          y: rowY,
          size: 8,
          font,
          color: black,
        });

        // Amount
        const amount = (li.quantity || 0) * (li.unitPrice || 0);
        page.drawText(amount.toFixed(2), {
          x: colX[5],
          y: rowY,
          size: 8,
          font: boldFont,
          color: black,
        });

        // If description is long, move next row a bit lower. We keep consistent 28 px row height to match image spacing
        rowY -= 28;

        // Draw a light separator line under each item (like image)
        page.drawLine({
          start: { x: tableX, y: rowY + 8 },
          end: { x: pageWidth - 40, y: rowY + 8 },
          thickness: 0.5,
          color: lightGray,
        });
      });

      // -------------------------
      // TOTALS (right aligned block, like image)
      // -------------------------
      const totalsTopY = rowY - 8;
      const labelX = 360;
      const valueX = pageWidth - 75;

      // Subtotal
      page.drawText("Subtotal", {
        x: labelX + 30,
        y: totalsTopY,
        size: 9,
        font,
        color: black,
      });
      page.drawText((quoteData.subtotal ?? 0).toFixed(2), {
        x: valueX,
        y: totalsTopY,
        size: 9,
        font: boldFont,
        color: black,
      });

      // TOTAL SALES TAX 15% (dynamic label if possible)
      const taxLabel = `TOTAL SALES TAX ${
        quoteData.lineItems[0]?.taxRate?.replace(/[^\d%]/g, "") ?? "15%"
      }`;
      page.drawText(taxLabel, {
        x: labelX - 25,
        y: totalsTopY - 18,
        size: 9,
        font,
        color: black,
      });
      page.drawText((quoteData.totalTax ?? 0).toFixed(2), {
        x: valueX,
        y: totalsTopY - 18,
        size: 9,
        font: boldFont,
        color: black,
      });

      // Separator lines
      page.drawLine({
        start: { x: labelX - 10, y: totalsTopY - 28 },
        end: { x: valueX + 40, y: totalsTopY - 28 },
        thickness: 1,
        color: black,
      });

      // TOTAL NAD
      page.drawText("TOTAL NAD", {
        x: labelX + 10,
        y: totalsTopY - 42,
        size: 11,
        font: boldFont,
        color: black,
      });
      page.drawText((quoteData.total ?? 0).toFixed(2), {
        x: valueX,
        y: totalsTopY - 42,
        size: 11,
        font: boldFont,
        color: black,
      });

      // small underline under total (like the image)
      page.drawLine({
        start: { x: labelX - 10, y: totalsTopY - 52 },
        end: { x: valueX + 40, y: totalsTopY - 52 },
        thickness: 0.5,
        color: darkGray,
      });

      // -------------------------
      // TERMS block (left side under table)
      // -------------------------
      const termsX = 40;
      const termsTopY = totalsTopY - 80;

      // Heading
      page.drawText("Terms", {
        x: termsX,
        y: termsTopY,
        size: 9,
        font: boldFont,
        color: black,
      });

      // Full-width line under "Terms"
      page.drawLine({
        start: { x: 40, y: termsTopY - 4 }, // start from left margin
        end: { x: pageWidth - 40, y: termsTopY - 4 }, // end near right margin
        thickness: 1,
        color: black,
      });

      // Terms text
      const termsLines = [
        "Quotations to be confirmed at time of booking a load.",
        "Quote validity: 28 Days",
        "",
        "Payment terms: Cash Clients",
        "50% Deposit prior to load",
        "50% Payment prior to delivery",
      ];

      termsLines.forEach((t, i) => {
        page.drawText(t, {
          x: termsX,
          y: termsTopY - 16 - i * 11,
          size: 8,
          font,
          color: darkGray,
        });
      });

      // -------------------------
      // Footer registration line (match text from image)
      // -------------------------
      const footerText =
        "Company Registration No: CC/2019/03048.  Registered Office: P.O Box 29111, Kugugas street, Northern Industrial, Windhoek, Unit 27 Baleo park, Windhoek, 9000, Namibia.";
      // page.drawLine({ start: { x: 20, y: 45 }, end: { x: pageWidth - 20, y: 45 }, thickness: 0.5, color: darkGray });
      page.drawText(footerText, {
        x: 25,
        y: 30,
        size: 7,
        font,
        color: darkGray,
      });

      // -------------------------
      // Save and download
      // -------------------------
      // -------------------------
      // Save and download
      // -------------------------
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });

      const currentYear = new Date().getFullYear();
      const quoteId = quoteData.id || "0000";

      const fileName = `QUOTE-${currentYear}-${quoteId}.pdf`;

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    } catch (err) {
      console.error("Error generating PDF:", err);
    }
  };

  return (
    <Button
      onClick={handleDownloadWithData}
      variant="secondary"
      className="text-white"
    >
      <Download className="mr-2 h-4 w-4" /> Download PDF
    </Button>
  );
}
