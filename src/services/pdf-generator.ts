/**
 * Represents the data needed to generate a PDF quotation.
 */
export interface QuotationData {
  /**
   * The name of the company.
   */
  companyName: string;
  /**
   * The email address of the customer.
   */
  customerEmail: string;
  /**
   * The name of the product.
   */
  productName: string;
  /**
   * The material of the product.
   */
  material: string;
  /**
   * The coating of the product.
   */
  coating: string;
  /**
   * The quantity of the product.
   */
  quantity: number;
  /**
   * The price per unit of the product.
   */
  pricePerUnit: number;
  /**
   * The total cost of the product.
   */
  totalCost: number;
}

/**
 * Asynchronously generates a PDF quotation based on the provided data.
 *
 * @param data The data used to generate the PDF.
 * @returns A promise that resolves to the path of the generated PDF file.
 */
export async function generatePdf(data: QuotationData): Promise<string> {
  // TODO: Implement this by calling WeasyPrint.
  console.log('Generating PDF with data:', data);
  return 'quotation.pdf';
}
