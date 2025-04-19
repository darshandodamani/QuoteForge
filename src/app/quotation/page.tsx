"use client";

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generatePdf } from '@/services/pdf-generator';
import { sendEmail } from '@/services/email';
import { useToast } from "@/hooks/use-toast"

const QuotationForm = () => {
  const [companyName, setCompanyName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [productName, setProductName] = useState('');
  const [material, setMaterial] = useState('');
  const [coating, setCoating] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [totalCost, setTotalCost] = useState(0);
  const [pricePerUnit, setPricePerUnit] = useState(0); // Added pricePerUnit state
	const { toast } = useToast()

  const products = [
    { name: 'Product A', material: 'Steel', coating: 'Powder', price: 50 },
    { name: 'Product B', material: 'Aluminum', coating: 'Anodized', price: 75 },
    { name: 'Product C', material: 'Plastic', coating: 'None', price: 25 },
  ];

  const calculateTotalCost = () => {
    const selectedProduct = products.find(p => p.name === productName);
    if (selectedProduct) {
      setPricePerUnit(selectedProduct.price);
      setTotalCost(selectedProduct.price * quantity);
    } else {
      setPricePerUnit(0);
      setTotalCost(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    calculateTotalCost();

    const quotationData = {
      companyName,
      customerEmail,
      productName,
      material,
      coating,
      quantity,
      pricePerUnit,
      totalCost,
    };

    try {
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
					title: "Quotation sent!",
					description: "Your quotation has been sent to the customer.",
				})
      } else {
				toast({
					variant: "destructive",
					title: "Uh oh! Something went wrong.",
					description: "There was a problem sending the quotation.",
				})
      }
    } catch (error) {
      console.error('Error generating PDF or sending email:', error);
			toast({
				variant: "destructive",
				title: "Uh oh! Something went wrong.",
				description: "There was a problem generating the PDF or sending the email.",
			})
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
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                type="email"
                id="customerEmail"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="productName">Product</Label>
              <Select onValueChange={setProductName}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.name} value={product.name}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="material">Material</Label>
              <Input
                type="text"
                id="material"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="Enter material"
              />
            </div>
            <div>
              <Label htmlFor="coating">Coating</Label>
              <Input
                type="text"
                id="coating"
                value={coating}
                onChange={(e) => setCoating(e.target.value)}
                placeholder="Enter coating"
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
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
            <Button type="submit" className="bg-accent text-accent-foreground">Generate Quotation</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationForm;
