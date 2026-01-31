import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const generateInvoicePDF = (invoice: any) => {
    const doc = new jsPDF() as any;

    // Header Colors & Styling
    const primaryColor: [number, number, number] = [29, 78, 216]; // #1d4ede (T&T Blue)
    const textColor: [number, number, number] = [51, 51, 51];

    // Company Logo / Name
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Tails & Tales', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Complete Pet Care Platform', 14, 26);

    // Invoice Title
    doc.setFontSize(26);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('INVOICE', 140, 25);

    doc.setFontSize(10);
    doc.text(`# ${invoice.invoice_number}`, 140, 32);

    // Divider
    doc.setDrawColor(230, 230, 230);
    doc.line(14, 40, 196, 40);

    // Billing Details
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('BILL TO:', 14, 50);

    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(10);
    doc.text(invoice.owner_name, 14, 56);
    doc.text(invoice.owner_email, 14, 61);
    doc.text(invoice.owner_phone, 14, 66);

    // Invoice Info
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('INVOICE DETAILS:', 140, 50);

    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(10);
    doc.text(`Date: ${format(new Date(invoice.created_at), 'MMMM dd, yyyy')}`, 140, 56);
    doc.text(`Due Date: ${format(new Date(invoice.due_date), 'MMMM dd, yyyy')}`, 140, 61);
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 140, 66);

    // Line Items Table
    const tableRows = invoice.line_items.map((item: any) => [
        item.description,
        item.quantity,
        `INR ${parseFloat(item.unit_price).toLocaleString('en-IN')}`,
        `INR ${parseFloat(item.total_price).toLocaleString('en-IN')}`
    ]);

    autoTable(doc, {
        startY: 80,
        head: [['Description', 'Qty', 'Unit Price', 'Total']],
        body: tableRows,
        theme: 'striped',
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        columnStyles: {
            3: { halign: 'right' }
        },
        margin: { top: 80 }
    });

    let finalY = (doc as any).lastAutoTable.finalY + 10;

    // Totals
    const summaryX = 140;
    doc.setFontSize(10);
    doc.text('Subtotal:', summaryX, finalY);
    doc.text(`INR ${parseFloat(invoice.subtotal).toLocaleString('en-IN')}`, 196, finalY, { align: 'right' });

    doc.text(`Tax (${invoice.tax_percentage}%):`, summaryX, finalY + 8);
    doc.text(`INR ${parseFloat(invoice.tax_amount).toLocaleString('en-IN')}`, 196, finalY + 8, { align: 'right' });

    let totalOffset = 16;
    if (parseFloat(invoice.discount_amount) > 0) {
        doc.setTextColor(22, 163, 74); // Green
        doc.text('Discount:', summaryX, finalY + 16);
        doc.text(`-INR ${parseFloat(invoice.discount_amount).toLocaleString('en-IN')}`, 196, finalY + 16, { align: 'right' });
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        totalOffset = 24;
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(summaryX, finalY + totalOffset - 2, 196, finalY + totalOffset - 2);

    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount:', summaryX, finalY + totalOffset + 8);
    doc.text(`INR ${parseFloat(invoice.total_amount).toLocaleString('en-IN')}`, 196, finalY + totalOffset + 8, { align: 'right' });

    finalY += totalOffset + 24;

    // Payment History
    if (invoice.payments && invoice.payments.length > 0) {
        if (finalY > 250) { doc.addPage(); finalY = 20; }

        doc.setFontSize(12);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('PAYMENT HISTORY:', 14, finalY);

        const paymentRows = invoice.payments.map((p: any) => [
            p.transaction_id || 'N/A',
            format(new Date(p.created_at), 'MMM dd, yyyy'),
            p.payment_method_used || p.payment_gateway,
            p.status.toUpperCase(),
            `INR ${parseFloat(p.amount).toLocaleString('en-IN')}`
        ]);

        autoTable(doc, {
            startY: finalY + 5,
            head: [['Transaction ID', 'Date', 'Method', 'Status', 'Amount']],
            body: paymentRows,
            theme: 'grid',
            headStyles: { fillColor: [240, 240, 240], textColor: [51, 51, 51], fontStyle: 'bold' },
            styles: { fontSize: 8 }
        });

        finalY = (doc as any).lastAutoTable.finalY + 15;
    }

    // Related Reference
    if (invoice.booking_id || invoice.subscription_id) {
        if (finalY > 260) { doc.addPage(); finalY = 20; }

        doc.setFontSize(12);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('RELATED REFERENCE:', 14, finalY);

        doc.setFontSize(10);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        if (invoice.booking_id) doc.text(`Booking Reference: ${invoice.booking_id}`, 14, finalY + 7);
        if (invoice.subscription_id) doc.text(`Subscription ID: ${invoice.subscription_id}`, 14, finalY + (invoice.booking_id ? 12 : 7));
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text('This is a computer-generated document. No signature is required.', 105, pageHeight - 15, { align: 'center' });
    doc.text('Thank you for choosing Tails & Tales!', 105, pageHeight - 10, { align: 'center' });

    doc.save(`invoice_${invoice.invoice_number}.pdf`);
};
