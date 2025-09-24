import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { QuoteItem, ClientInfo, CompanySettings } from '../types';
import { format } from 'date-fns';

export const generateQuoteNumber = (): string => {
  const today = new Date();
  const dateStr = format(today, 'yyyyMMdd');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `QT-${dateStr}-${random}`;
};

export const exportToPDF = (
  quoteNumber: string,
  clientInfo: ClientInfo,
  items: QuoteItem[],
  subtotal: number,
  gst: number,
  total: number,
  companySettings?: CompanySettings
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.text('QUOTATION', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Company information
  doc.setFontSize(12);
  if (companySettings?.isConfigured) {
    doc.setFontSize(14);
    doc.text(companySettings.companyName, 20, yPosition);
    yPosition += 6;

    if (companySettings.tradingName) {
      doc.setFontSize(10);
      doc.text(`Trading as: ${companySettings.tradingName}`, 20, yPosition);
      yPosition += 5;
    }

    doc.setFontSize(10);
    doc.text(companySettings.address.street, 20, yPosition);
    yPosition += 4;
    doc.text(`${companySettings.address.suburb}, ${companySettings.address.state} ${companySettings.address.postcode}`, 20, yPosition);
    yPosition += 4;
    doc.text(companySettings.address.country, 20, yPosition);
    yPosition += 6;

    if (companySettings.abn) {
      doc.text(`ABN: ${companySettings.abn}`, 20, yPosition);
      yPosition += 4;
    }

    doc.text(`Phone: ${companySettings.phone}`, 20, yPosition);
    yPosition += 4;
    doc.text(`Email: ${companySettings.email}`, 20, yPosition);
    yPosition += 4;

    if (companySettings.website) {
      doc.text(`Website: ${companySettings.website}`, 20, yPosition);
      yPosition += 4;
    }

    yPosition += 6;
  } else {
    // Fallback to placeholders if not configured
    doc.text('[COMPANY NAME - Configure in Admin Panel]', 20, yPosition);
    yPosition += 5;
    doc.text('[COMPANY ADDRESS]', 20, yPosition);
    yPosition += 5;
    doc.text('ABN: [COMPANY ABN]', 20, yPosition);
    yPosition += 5;
    doc.text('Phone: [COMPANY PHONE]', 20, yPosition);
    yPosition += 15;
  }

  // Quote details
  doc.text(`Quote Number: ${quoteNumber}`, 20, yPosition);
  doc.text(`Date: ${format(new Date(), 'dd/MM/yyyy')}`, pageWidth - 60, yPosition);
  yPosition += 5;
  const validityDays = companySettings?.validityPeriod || 30;
  doc.text(`Valid Until: ${format(new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000), 'dd/MM/yyyy')}`, pageWidth - 60, yPosition);
  yPosition += 15;

  // Client information
  doc.text('Quote For:', 20, yPosition);
  yPosition += 8;
  doc.text(clientInfo.name, 20, yPosition);
  yPosition += 5;
  if (clientInfo.abn) {
    doc.text(`ABN: ${clientInfo.abn}`, 20, yPosition);
    yPosition += 5;
  }
  doc.text(`${clientInfo.address}`, 20, yPosition);
  yPosition += 5;
  doc.text(`${clientInfo.suburb} ${clientInfo.state} ${clientInfo.postcode}`, 20, yPosition);
  yPosition += 5;
  doc.text(`Contact: ${clientInfo.contactPerson}`, 20, yPosition);
  yPosition += 5;
  doc.text(`Email: ${clientInfo.email}`, 20, yPosition);
  yPosition += 5;
  doc.text(`Phone: ${clientInfo.phone}`, 20, yPosition);
  yPosition += 15;

  // Items table header
  doc.setFontSize(10);
  doc.text('Description', 20, yPosition);
  doc.text('Qty', 120, yPosition);
  doc.text('Unit Price', 140, yPosition);
  doc.text('Total', 170, yPosition);
  yPosition += 3;

  // Draw line under header
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 5;

  // Items
  items.forEach((item) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.text(item.equipment.name, 20, yPosition);
    doc.text(item.quantity.toString(), 120, yPosition);
    doc.text(`$${item.unitPrice.toFixed(2)}`, 140, yPosition);
    doc.text(`$${item.totalPrice.toFixed(2)}`, 170, yPosition);
    yPosition += 5;
  });

  // Totals
  yPosition += 5;
  doc.line(120, yPosition, pageWidth - 20, yPosition);
  yPosition += 8;

  doc.text('Subtotal:', 140, yPosition);
  doc.text(`$${subtotal.toFixed(2)}`, 170, yPosition);
  yPosition += 5;

  doc.text('GST (10%):', 140, yPosition);
  doc.text(`$${gst.toFixed(2)}`, 170, yPosition);
  yPosition += 5;

  doc.setFontSize(12);
  doc.text('Total:', 140, yPosition);
  doc.text(`$${total.toFixed(2)}`, 170, yPosition);

  // Footer with terms and conditions
  yPosition = doc.internal.pageSize.height - 60;
  doc.setFontSize(9);

  if (companySettings?.isConfigured) {
    // Custom terms and conditions
    doc.text('TERMS & CONDITIONS:', 20, yPosition);
    yPosition += 5;

    doc.setFontSize(8);
    const termsLines = companySettings.termsAndConditions.split('\n').filter(line => line.trim());
    termsLines.forEach((line, index) => {
      if (yPosition < doc.internal.pageSize.height - 20 && index < 8) { // Limit to prevent overflow
        doc.text(line.substring(0, 120), 20, yPosition); // Truncate long lines
        yPosition += 3.5;
      }
    });

    yPosition += 5;
    doc.text(`Payment Terms: ${companySettings.paymentTerms}`, 20, yPosition);
    yPosition += 4;
    doc.text(companySettings.footerText, 20, yPosition);
  } else {
    // Default terms
    doc.text('Terms: Payment due within 30 days. GST included where applicable.', 20, yPosition);
    doc.text(`This quote is valid for ${validityDays} days from the date of issue.`, 20, yPosition + 5);
  }

  doc.save(`Quote-${quoteNumber}.pdf`);
};

export const exportToExcel = (
  quoteNumber: string,
  clientInfo: ClientInfo,
  items: QuoteItem[],
  subtotal: number,
  gst: number,
  total: number,
  companySettings?: CompanySettings
) => {
  const workbook = XLSX.utils.book_new();

  // Create quote data with company information
  const validityDays = companySettings?.validityPeriod || 30;
  const quoteData = [
    ['QUOTATION'],
    [''],
    ...(companySettings?.isConfigured ? [
      ['Company Information:'],
      ['Company Name:', companySettings.companyName],
      ...(companySettings.tradingName ? [['Trading Name:', companySettings.tradingName]] : []),
      ['Address:', companySettings.address.street],
      ['', `${companySettings.address.suburb}, ${companySettings.address.state} ${companySettings.address.postcode}`],
      ['', companySettings.address.country],
      ...(companySettings.abn ? [['ABN:', companySettings.abn]] : []),
      ['Phone:', companySettings.phone],
      ['Email:', companySettings.email],
      ...(companySettings.website ? [['Website:', companySettings.website]] : []),
      ['']
    ] : []),
    ['Quote Number:', quoteNumber],
    ['Date:', format(new Date(), 'dd/MM/yyyy')],
    ['Valid Until:', format(new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000), 'dd/MM/yyyy')],
    [''],
    ['Client Information:'],
    ['Company:', clientInfo.name],
    ['ABN:', clientInfo.abn || ''],
    ['Address:', clientInfo.address],
    ['Suburb:', clientInfo.suburb],
    ['State:', clientInfo.state],
    ['Postcode:', clientInfo.postcode],
    ['Contact:', clientInfo.contactPerson],
    ['Email:', clientInfo.email],
    ['Phone:', clientInfo.phone],
    [''],
    ['Items:'],
    ['Description', 'Quantity', 'Unit Price', 'Total Price'],
    ...items.map(item => [
      item.equipment.name,
      item.quantity,
      item.unitPrice,
      item.totalPrice
    ]),
    [''],
    ['Subtotal:', '', '', subtotal],
    ['GST (10%):', '', '', gst],
    ['Total:', '', '', total]
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(quoteData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Quote');

  XLSX.writeFile(workbook, `Quote-${quoteNumber}.xlsx`);
};

export const exportToCSV = (
  quoteNumber: string,
  clientInfo: ClientInfo,
  items: QuoteItem[],
  subtotal: number,
  gst: number,
  total: number,
  companySettings?: CompanySettings
) => {
  const csvData = [
    ['Quote Number', quoteNumber],
    ['Date', format(new Date(), 'dd/MM/yyyy')],
    ['Client', clientInfo.name],
    ['ABN', clientInfo.abn || ''],
    ['Address', `${clientInfo.address}, ${clientInfo.suburb} ${clientInfo.state} ${clientInfo.postcode}`],
    ['Contact', clientInfo.contactPerson],
    ['Email', clientInfo.email],
    ['Phone', clientInfo.phone],
    [''],
    ['Description', 'Quantity', 'Unit Price', 'Total Price'],
    ...items.map(item => [
      item.equipment.name,
      item.quantity,
      item.unitPrice.toFixed(2),
      item.totalPrice.toFixed(2)
    ]),
    [''],
    ['Subtotal', '', '', subtotal.toFixed(2)],
    ['GST (10%)', '', '', gst.toFixed(2)],
    ['Total', '', '', total.toFixed(2)]
  ];

  const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Quote-${quoteNumber}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};