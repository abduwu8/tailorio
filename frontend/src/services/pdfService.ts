import jsPDF from 'jspdf';

export const updatePDFWithTailoredText = async (
  _originalPdfUrl: string,
  tailoredText: string
): Promise<Blob> => {
  try {
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Set font size and calculate line height
    const fontSize = 11;
    const lineHeight = fontSize * 0.5;
    
    // Set margins (in mm)
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - (margin * 2);
    
    // Split text into lines that fit within the page width
    const lines = doc.setFontSize(fontSize).splitTextToSize(tailoredText, maxWidth);
    
    // Calculate how many lines can fit on one page
    const pageHeight = doc.internal.pageSize.getHeight();
    const linesPerPage = Math.floor((pageHeight - (margin * 2)) / lineHeight);
    
    // Add text to pages
    let currentPage = 0;
    for (let i = 0; i < lines.length; i++) {
      if (i % linesPerPage === 0 && i !== 0) {
        doc.addPage();
        currentPage++;
      }
      
      const y = margin + ((i % linesPerPage) * lineHeight);
      doc.text(lines[i], margin, y);
    }
    
    // Convert to blob
    const pdfBlob = doc.output('blob');
    return pdfBlob;
  } catch (error) {
    console.error('Error updating PDF:', error);
    throw new Error('Failed to update PDF with tailored text');
  }
}; 