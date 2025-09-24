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
  const pageHeight = doc.internal.pageSize.height;
  const margins = { left: 20, right: 20, top: 20, bottom: 20 };
  let yPosition = margins.top;

  // Colors for professional styling
  const primaryColor = companySettings?.primaryColor || '#1f2937';
  const lightGray = '#f3f4f6';
  const darkGray = '#374151';

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 31, g: 41, b: 55 };
  };

  const primaryRgb = hexToRgb(primaryColor);

  // HEADER SECTION WITH BACKGROUND
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Company name in header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  if (companySettings?.isConfigured) {
    doc.text(companySettings.companyName, margins.left, 25);
  } else {
    doc.text('[CONFIGURE COMPANY NAME]', margins.left, 25);
  }

  // QUOTATION title on right
  doc.setFontSize(20);
  doc.text('QUOTATION', pageWidth - margins.right, 25, { align: 'right' });

  yPosition = 45;

  // COMPANY DETAILS SECTION
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');

  if (companySettings?.isConfigured) {
    const companyDetails = [
      companySettings.address.street,
      `${companySettings.address.suburb}, ${companySettings.address.state} ${companySettings.address.postcode}`,
      companySettings.address.country,
      ...(companySettings.abn ? [`ABN: ${companySettings.abn}`] : []),
      `Phone: ${companySettings.phone}`,
      `Email: ${companySettings.email}`,
      ...(companySettings.website ? [`Web: ${companySettings.website}`] : [])
    ];

    companyDetails.forEach((detail) => {
      doc.text(detail, margins.left, yPosition);
      yPosition += 4;
    });
  } else {
    doc.text('Configure company details in Admin Panel', margins.left, yPosition);
    yPosition += 8;
  }

  // QUOTE DETAILS BOX
  yPosition += 5;
  const validityDays = companySettings?.validityPeriod || 30;

  // Light background box for quote details
  doc.setFillColor(243, 244, 246);
  doc.rect(pageWidth - 100, yPosition - 3, 80, 20, 'F');

  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('Quote Number:', pageWidth - 95, yPosition + 2);
  doc.setFont(undefined, 'normal');
  doc.text(quoteNumber, pageWidth - 95, yPosition + 6);

  doc.setFont(undefined, 'bold');
  doc.text('Date:', pageWidth - 95, yPosition + 10);
  doc.setFont(undefined, 'normal');
  doc.text(format(new Date(), 'dd/MM/yyyy'), pageWidth - 95, yPosition + 14);

  doc.setFont(undefined, 'bold');
  doc.text('Valid Until:', pageWidth - 45, yPosition + 2);
  doc.setFont(undefined, 'normal');
  doc.text(format(new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000), 'dd/MM/yyyy'), pageWidth - 45, yPosition + 6);

  yPosition += 35;

  // CLIENT INFORMATION SECTION
  doc.setFillColor(55, 65, 81);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.rect(margins.left, yPosition - 3, pageWidth - margins.left - margins.right, 8, 'F');
  doc.text('QUOTE FOR:', margins.left + 3, yPosition + 2);

  yPosition += 12;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');

  const clientDetails = [
    `Company: ${clientInfo.name}`,
    `Contact: ${clientInfo.contactPerson}`,
    `Address: ${clientInfo.address}`,
    `${clientInfo.suburb}, ${clientInfo.state} ${clientInfo.postcode}`,
    `Email: ${clientInfo.email}`,
    `Phone: ${clientInfo.phone}`
  ];

  clientDetails.forEach((detail) => {
    doc.text(detail, margins.left + 3, yPosition);
    yPosition += 4;
  });

  yPosition += 10;

  // ITEMS TABLE WITH PROPER FORMATTING
  // Table header
  doc.setFillColor(55, 65, 81);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.rect(margins.left, yPosition - 3, pageWidth - margins.left - margins.right, 8, 'F');

  // Column headers with proper alignment
  doc.text('DESCRIPTION', margins.left + 3, yPosition + 2);
  doc.text('QTY', pageWidth - 100, yPosition + 2, { align: 'center' });
  doc.text('UNIT PRICE', pageWidth - 70, yPosition + 2, { align: 'center' });
  doc.text('TOTAL', pageWidth - 30, yPosition + 2, { align: 'center' });

  yPosition += 12;

  // Table rows with alternating colors
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'normal');

  items.forEach((item, index) => {
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = margins.top + 10;
    }

    // Alternating row colors
    if (index % 2 === 0) {
      doc.setFillColor(248, 249, 250);
      doc.rect(margins.left, yPosition - 2, pageWidth - margins.left - margins.right, 8, 'F');
    }

    // Truncate long equipment names
    const itemName = item.equipment.name.length > 45
      ? item.equipment.name.substring(0, 45) + '...'
      : item.equipment.name;

    doc.text(itemName, margins.left + 3, yPosition + 2);
    doc.text(item.quantity.toString(), pageWidth - 100, yPosition + 2, { align: 'center' });
    doc.text(`$${item.unitPrice.toFixed(2)}`, pageWidth - 70, yPosition + 2, { align: 'center' });
    doc.text(`$${item.totalPrice.toFixed(2)}`, pageWidth - 30, yPosition + 2, { align: 'center' });

    yPosition += 8;
  });

  // TOTALS SECTION
  yPosition += 5;

  // Totals box
  doc.setFillColor(243, 244, 246);
  doc.rect(pageWidth - 100, yPosition, 80, 25, 'F');
  doc.setDrawColor(55, 65, 81);
  doc.rect(pageWidth - 100, yPosition, 80, 25);

  yPosition += 5;
  doc.setFont(undefined, 'normal');
  doc.text('Subtotal:', pageWidth - 95, yPosition);
  doc.text(`$${subtotal.toFixed(2)}`, pageWidth - 25, yPosition, { align: 'right' });

  yPosition += 5;
  doc.text('GST (10%):', pageWidth - 95, yPosition);
  doc.text(`$${gst.toFixed(2)}`, pageWidth - 25, yPosition, { align: 'right' });

  yPosition += 5;
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', pageWidth - 95, yPosition);
  doc.text(`$${total.toFixed(2)}`, pageWidth - 25, yPosition, { align: 'right' });

  // ADD NEW PAGE FOR TERMS & CONDITIONS
  doc.addPage();
  yPosition = margins.top + 10;

  // TERMS & CONDITIONS HEADER - Full width branded header
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('TERMS & CONDITIONS', pageWidth / 2, 25, { align: 'center' });

  yPosition = 45;

  // Company name and quote reference on terms page
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  if (companySettings?.isConfigured) {
    doc.text(companySettings.companyName, margins.left, yPosition);
  } else {
    doc.text('[COMPANY NAME]', margins.left, yPosition);
  }

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Quote: ${quoteNumber}`, pageWidth - margins.right, yPosition, { align: 'right' });

  yPosition += 15;

  if (companySettings?.isConfigured) {
    // Full terms & conditions text with proper formatting
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    const termsLines = companySettings.termsAndConditions
      .split('\n')
      .filter(line => line.trim());

    const pageContentWidth = pageWidth - margins.left - margins.right;

    termsLines.forEach((line) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margins.top + 10;
      }

      if (line.match(/^\d+\./)) {
        // Numbered terms - make them bold and add extra spacing
        yPosition += 3;
        doc.setFont(undefined, 'bold');
        const wrappedText = doc.splitTextToSize(line, pageContentWidth);
        wrappedText.forEach((wrappedLine: string) => {
          doc.text(wrappedLine, margins.left, yPosition);
          yPosition += 5;
        });
        doc.setFont(undefined, 'normal');
        yPosition += 2;
      } else if (line.toUpperCase() === line && line.length > 10) {
        // Section headers (all caps) - make bold and centered
        yPosition += 5;
        doc.setFont(undefined, 'bold');
        doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 8;
        doc.setFont(undefined, 'normal');
      } else if (line.trim()) {
        // Regular text
        const wrappedText = doc.splitTextToSize(line, pageContentWidth);
        wrappedText.forEach((wrappedLine: string) => {
          doc.text(wrappedLine, margins.left, yPosition);
          yPosition += 4;
        });
        yPosition += 1;
      } else {
        // Empty line for spacing
        yPosition += 4;
      }
    });

    // Payment Terms and Footer Section
    yPosition += 15;

    // Payment terms box
    doc.setFillColor(243, 244, 246);
    doc.rect(margins.left, yPosition - 5, pageContentWidth, 25, 'F');
    doc.setDrawColor(55, 65, 81);
    doc.rect(margins.left, yPosition - 5, pageContentWidth, 25);

    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('PAYMENT TERMS', margins.left + 10, yPosition + 2);

    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    doc.text(companySettings.paymentTerms, margins.left + 10, yPosition + 8);

    yPosition += 30;

    // Footer message
    if (companySettings.footerText) {
      doc.setFont(undefined, 'italic');
      doc.setFontSize(12);
      doc.text(companySettings.footerText, pageWidth / 2, yPosition, { align: 'center' });
    }

    // Add contact information at bottom
    yPosition = pageHeight - 30;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text('Questions about these terms?', margins.left, yPosition);
    doc.text(`Contact: ${companySettings.phone} | ${companySettings.email}`, margins.left, yPosition + 5);

  } else {
    // Default terms when not configured
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    const defaultTerms = [
      '',
      'STANDARD TERMS & CONDITIONS',
      '',
      '1. Payment is due within 30 days of invoice date unless otherwise agreed in writing.',
      '',
      '2. All work will be carried out in accordance with relevant Australian Standards and Building Codes.',
      '',
      '3. This quotation is valid for 30 days from the date shown above.',
      '',
      '4. Prices include GST where applicable.',
      '',
      '5. Any variations to the scope of work may incur additional charges.',
      '',
      '6. Installation work requires safe access to all areas. Additional charges may apply for difficult access.',
      '',
      '7. Client is responsible for obtaining any required permits or approvals.',
      '',
      '8. Equipment warranty as per manufacturer specifications.',
      '',
      '',
      'Please configure your company settings in the Admin Panel to customize these terms.'
    ];

    defaultTerms.forEach((line) => {
      if (line.toUpperCase() === line && line.length > 10) {
        doc.setFont(undefined, 'bold');
        doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 8;
        doc.setFont(undefined, 'normal');
      } else if (line.match(/^\d+\./)) {
        doc.setFont(undefined, 'bold');
        const wrappedText = doc.splitTextToSize(line, pageWidth - margins.left - margins.right);
        wrappedText.forEach((wrappedLine: string) => {
          doc.text(wrappedLine, margins.left, yPosition);
          yPosition += 5;
        });
        doc.setFont(undefined, 'normal');
        yPosition += 2;
      } else if (line.trim()) {
        const wrappedText = doc.splitTextToSize(line, pageWidth - margins.left - margins.right);
        wrappedText.forEach((wrappedLine: string) => {
          doc.text(wrappedLine, margins.left, yPosition);
          yPosition += 4;
        });
      } else {
        yPosition += 4;
      }
    });
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
    ['', '', 'Subtotal:', subtotal],
    ['', '', 'GST (10%):', gst],
    ['', '', 'Total:', total]
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
    ['Contact', clientInfo.contactPerson],
    [''],
    ['Description', 'Quantity', 'Unit Price', 'Total Price'],
    ...items.map(item => [
      item.equipment.name,
      item.quantity.toString(),
      item.unitPrice.toFixed(2),
      item.totalPrice.toFixed(2)
    ]),
    [''],
    ['Subtotal', '', '', subtotal.toFixed(2)],
    ['GST (10%)', '', '', gst.toFixed(2)],
    ['Total', '', '', total.toFixed(2)]
  ];

  const csvContent = csvData.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Quote-${quoteNumber}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};