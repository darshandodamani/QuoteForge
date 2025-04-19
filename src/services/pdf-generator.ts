export interface QuotationData {
  companyName: string;
  customerEmail: string;
  productName: string;
  material: string;
  coating: string;
  quantity: number;
  pricePerUnit: number;
  totalCost: number;
}

export async function generatePdf(data: QuotationData): Promise<string> {
  console.log('Generating PDF with data:', data);
  // For now, just return a dummy path
  return 'dummy_quotation.pdf';
}
