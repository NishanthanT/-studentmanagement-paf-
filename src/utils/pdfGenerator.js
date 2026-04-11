import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as htmlToImage from 'html-to-image';

export const generateBookingReportPDF = async (reportElementId, bookings, resources) => {
    try {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // 1. Capture the Charts Dashboard (from the hidden DOM element)
        const element = document.getElementById(reportElementId);
        if (element) {
            const imgData = await htmlToImage.toPng(element, {
                quality: 1.0,
                pixelRatio: 2,
                skipFonts: false
            });
            
            // Calculate aspect ratio fit for A4 width
            const imgProps = doc.getImageProperties(imgData);
            const pdfWidth = pageWidth - 20; // 10mm margins on both sides
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // Add Cover Dashboard to PDF
            doc.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
        }

        // 2. Save the PDF securely
        doc.save(`Campus_Resource_Analytics_${new Date().toISOString().split('T')[0]}.pdf`);
        return true;
    } catch (err) {
        console.error("PDF Generation Error:", err);
        throw err;
    }
};
