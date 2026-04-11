import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalysisResult } from '../hooks/useReportGenerator';

export const exportToCSV = (data: AnalysisResult, filename: string) => {
  const rows = [
    ['Section', 'Type', 'Content'],
    ['Observed Trends', 'Brief', data.brief.observedTrends],
    ['Observed Trends', 'Detailed', data.detailed.observedTrends],
    ['Regulatory Context', 'Brief', data.brief.regulatoryContext],
    ['Regulatory Context', 'Detailed', data.detailed.regulatoryContext],
    ['Literature Benchmarks', 'Brief', data.brief.literatureBenchmarks],
    ['Literature Benchmarks', 'Detailed', data.detailed.literatureBenchmarks],
    ['Summary', 'Short', data.shortSummary],
  ];

  // Add Citations
  if (data.citations.length > 0) {
    rows.push(['', '', '']);
    rows.push(['Citations', 'Fact', 'Source']);
    data.citations.forEach(cite => {
      rows.push(['Citation', cite.fact, cite.source]);
    });
  }

  const csvContent = "data:text/csv;charset=utf-8," 
    + rows.map(e => e.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = async (element: HTMLElement | null, filename: string, isDarkMode: boolean) => {
  if (!element) return;
  
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: isDarkMode ? '#000000' : '#ffffff',
    logging: false,
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
  // Handle multi-page if needed (simplified for now)
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${filename}.pdf`);
};
