'use client';

import React, {useState, useEffect} from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {generatePdf} from '@/services/pdf-generator';
import {sendEmail} from '@/services/email';
import {useToast} from '@/hooks/use-toast';
import {initializeDatabase, openDb} from '@/lib/sqlite';

interface Product {
  id: number;
  name: string;
}

interface Material {
  material_id: number;
  name: string;
}

interface Coating {
  coating_id: number;
  name: string;
}

const QuotationForm = () => {
  const [companyName, setCompanyName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [totalCost, setTotalCost] = useState(0);

  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [coatings, setCoatings] = useState<Coating[]>([]);

  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(
    null
  );
  const [selectedCoatingId, setSelectedCoatingId] = useState<number | null>(
    null
  );

  const {toast} = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeDatabase(); // Ensure DB is initialized

        const db = await openDb();

        // Load Products
        const productsData: Product[] = await db.all(
          'SELECT id, name FROM Products'
        );
        setProducts(productsData);

        // Load Materials
        const materialsData: Material[] = await db.all(
          'SELECT material_id, name FROM Materials'
        );
        setMaterials(materialsData);

        // Load Coatings
        const coatingsData: Coating[] = await db.all(
          'SELECT coating_id, name FROM Coatings'
        );
        setCoatings(coatingsData);

        // Insert default CostParameters if it doesn't exist
        const costParams = await db.get(
          'SELECT * FROM CostParameters WHERE parameter_id = 1'
        );
        if (!costParams) {
          await db.run(
            'INSERT INTO CostParameters (parameter_id, labor_rate, overhead_rate) VALUES (1, 50.00, 0.20)'
          );
        }

        await db.close();
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'Failed to load products, materials, and coatings.',
        });
      }
    };

    loadData();
  }, [toast]);

  const calculateTotalCost = async () => {
    if (!selectedProductId || !selectedMaterialId || !selectedCoatingId) {
      return;
    }

    try {
      const db = await openDb();

      // Fetch costs and rates from the database
      const product: Product = await db.get(
        'SELECT * FROM Products WHERE id = ?',
        selectedProductId
      );
      const material: Material = await db.get(
        'SELECT * FROM Materials WHERE material_id = ?',
        selectedMaterialId
      );
      const coating: Coating = await db.get(
        'SELECT * FROM Coatings WHERE coating_id = ?',
        selectedCoatingId
      );
      const costParams = await db.get(
        'SELECT * FROM CostParameters WHERE parameter_id = 1'
      );

      // Fetch operations and their multipliers
      const operations = await db.all(
        `SELECT Operations.base_labor_cost, Product_Operations.cost_multiplier
         FROM Operations
         INNER JOIN Product_Operations ON Operations.operation_id = Product_Operations.operation_id
         WHERE Product_Operations.product_id = ?`,
        selectedProductId
      );

      await db.close();

      if (!product || !material || !coating || !costParams) {
        console.error('Could not retrieve required data for cost calculation.');
        return;
      }

      // Perform cost calculation (simplified for POC)
      const materialCost = material.cost_per_mm * quantity * 10; // Example volume calculation (adjust as needed)
      const coatingCost = coating.cost_per_mm * quantity * 5; // Example surface area (adjust as needed)

      let laborCost = 0;
      operations.forEach(op => {
        laborCost += op.base_labor_cost * op.cost_multiplier * quantity;
      });

      const overheadCost = laborCost * costParams.overhead_rate;
      const total = materialCost + coatingCost + laborCost + overheadCost;

      setTotalCost(total);
    } catch (error) {
      console.error('Error calculating total cost:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Failed to calculate total cost.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId || !selectedMaterialId || !selectedCoatingId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a product, material, and coating.',
      });
      return;
    }

    try {
      const db = await openDb();

      // Fetch names for PDF
      const product: Product = await db.get(
        'SELECT * FROM Products WHERE id = ?',
        selectedProductId
      );
      const material: Material = await db.get(
        'SELECT * FROM Materials WHERE material_id = ?',
        selectedMaterialId
      );
      const coating: Coating = await db.get(
        'SELECT * FROM Coatings WHERE coating_id = ?',
        selectedCoatingId
      );
      await db.close();

      if (!product || !material || !coating) {
        console.error('Could not retrieve required data for PDF.');
        return;
      }

      const quotationData = {
        companyName,
        customerEmail,
        productName: product.name,
        material: material.name,
        coating: coating.name,
        quantity,
        pricePerUnit: totalCost / quantity, //This is wrong since totalCost is after volume
        totalCost,
      };

      // Generate PDF
      const pdfPath = await generatePdf(quotationData);

      // Send Email
      const emailParams = {
        to: customerEmail,
        subject: 'Quotation for Your Product',
        html: '<p>Please find attached the quotation for your product.</p>',
        attachmentPath: pdfPath,
      };

      const emailSent = await sendEmail(emailParams);

      if (emailSent) {
        toast({
          title: 'Quotation sent!',
          description: 'Your quotation has been sent to the customer.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'There was a problem sending the quotation.',
        });
      }
    } catch (error) {
      console.error('Error generating PDF or sending email:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description:
          'There was a problem generating the PDF or sending the email.',
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-full max-w-2xl p-4">
        <CardHeader>
          <CardTitle className="text-2xl">Quotation Form</CardTitle>
          <CardDescription>Fill in the details to generate a quotation.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                type="text"
                id="companyName"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                type="email"
                id="customerEmail"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="productName">Product</Label>
              <Select onValueChange={value => setSelectedProductId(parseInt(value || '0'))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="material">Material</Label>
              <Select onValueChange={value => setSelectedMaterialId(parseInt(value || '0'))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a material" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map(material => (
                    <SelectItem
                      key={material.material_id}
                      value={material.material_id.toString()}
                    >
                      {material.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="coating">Coating</Label>
              <Select onValueChange={value => setSelectedCoatingId(parseInt(value || '0'))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a coating" />
                </SelectTrigger>
                <SelectContent>
                  {coatings.map(coating => (
                    <SelectItem
                      key={coating.coating_id}
                      value={coating.coating_id.toString()}
                    >
                      {coating.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                type="number"
                id="quantity"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <Label htmlFor="totalCost">Total Cost</Label>
              <Input
                type="text"
                id="totalCost"
                value={totalCost.toFixed(2)}
                readOnly
              />
            </div>
            <Button type="button" className="bg-accent text-accent-foreground" onClick={calculateTotalCost}>
              Calculate Cost</Button>
            <Button type="submit" className="bg-accent text-accent-foreground">Generate Quotation</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationForm;
