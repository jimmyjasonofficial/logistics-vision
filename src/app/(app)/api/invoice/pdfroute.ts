import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET() {
  const templatePath = path.join(process.cwd(), "public", "Invoice_INL-26895.pdf");
  const existingPdfBytes = fs.readFileSync(templatePath);

  // 2. Load and prepare the PDF
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  const { width, height } = firstPage.getSize();

  // 3. Example dynamic data
  const data = {
    customerName: "Ab-Inbev Namibia (Pty) Ltd",
    invoiceDate: "23 Sep 2025",
    accountNumber: "AB1001",
    invoiceNumber: "INL-26895",
    reference: "K0MV0XCRR",
    vat: "10251490",
    total: "17,487.36",
    subtotal: "15,206.40",
    tax: "2,280.96",
  };

  // 4. Write text (x,y values adjust according to your PDF layout)
  firstPage.drawText(data.invoiceDate, { x: 400, y: height - 140, size: 10, font: helveticaFont, color: rgb(0, 0, 0) });
  firstPage.drawText(data.accountNumber, { x: 400, y: height - 160, size: 10, font: helveticaFont });
  firstPage.drawText(data.invoiceNumber, { x: 400, y: height - 180, size: 10, font: helveticaFont });
  firstPage.drawText(data.reference, { x: 400, y: height - 200, size: 10, font: helveticaFont });
  firstPage.drawText(data.vat, { x: 400, y: height - 220, size: 10, font: helveticaFont });

  firstPage.drawText(data.subtotal, { x: 460, y: height - 540, size: 10, font: helveticaFont });
  firstPage.drawText(data.tax, { x: 460, y: height - 555, size: 10, font: helveticaFont });
  firstPage.drawText(data.total, { x: 460, y: height - 580, size: 11, font: helveticaFont, color: rgb(0, 0, 0) });

  // 5. Save the modified PDF
  const pdfBytes = await pdfDoc.save();

  // 6. Return PDF for download
  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=invoice.pdf",
    },
  });
}
