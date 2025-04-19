# **App Name**: QuoteCraft

## Core Features:

- Basic Login: Allow a single user to log in using hardcoded credentials.
- Order Form: A form to input company name, customer email, product (dropdown), material, coating, and quantity.
- Quotation Calculation: Automatically calculate the total cost based on quantity and price per unit, fetching prices from a predefined data structure.
- PDF Generation: Generate a professional-looking PDF quotation using WeasyPrint.
- Email Delivery: Send the generated PDF quotation to the customer's email address using SMTP.

## Style Guidelines:

- Primary color: White or light gray for a clean background.
- Secondary color: A professional blue (#3498db) for headings and important elements.
- Accent: Green (#2ecc71) for success messages and call-to-action buttons.
- Clear and readable sans-serif fonts for form labels and data display.
- Use Bootstrap or Tailwind CSS grid system for a responsive and well-structured layout.
- Simple and professional icons for form elements and buttons.

## Original User Request:
Using Backend: Python + Flask (lightweight, easy to implement).
Frontend: HTML, CSS (Bootstrap/Tailwind for clean design).
Database: SQLite (simple, local). Build an application named automatic Quotation Generation". 

Our PoC version should have:

Basic Login (Single User Initially):
Simple username/password login.
Order Form:
Input Fields:
Company Name
Customer Email
Product
Material Type
Coating
Quantity
(Simple form with dropdowns and input fields.)
Quotation Calculation:
Automatically calculate total cost (Price per Unit × Quantity).
Initial setup: Use fixed prices stored in your code or a simple SQLite table.
PDF Generation:
Generate a neat, professional quotation PDF.
Email Delivery:
Send PDF quotation via email using SMTP.

Step 3: Database Schema (Simplified for PoC)
Use SQLite to store essential data.

Tables for PoC:
1. Products Table
Stores product details, including material, coating type, and price per unit.

CREATE TABLE Products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    material TEXT NOT NULL,
    coating TEXT NOT NULL,
    price_per_unit REAL NOT NULL
);
2. Quotations Table
Tracks quotation details, such as company name, customer email, product information, total cost, and date.

CREATE TABLE Quotations (
    Quotation_ID INTEGER PRIMARY KEY,
    Company_Name TEXT NOT NULL,
    Customer_Email TEXT NOT NULL,
    Product_Name TEXT NOT NULL,
    Material TEXT NOT NULL,
    Coating TEXT NOT NULL,
    Quantity INTEGER NOT NULL,
    Price_Per_Unit REAL NOT NULL,
    Total_Cost REAL NOT NULL,
    Quotation_Date DATE NOT NULL
);
✅ Step 4: Simple UI
Use basic HTML/CSS forms.

Pages Required:
Login Page:

Simple user authentication (hardcoded user initially).
Quotation Generation Form Page:

For input and calculations.
Confirmation Page:

Displays "Quotation successfully sent" message.
Sample Form Fields:
Company Name
Customer Email
Product (dropdown)
Material selection
Coating
Quantity
✅ Step 5: Backend Logic (Flask)
Create Routes:
1. Login:
Basic authentication (hard-coded credentials initially).
2. Quotation Form:
Display form, handle submission, and calculation.
Save data to SQLite.
3. Generate PDF:
Using WeasyPrint to generate a PDF for the quotation.
from weasyprint import HTML

# Example PDF generation
HTML(string=html_content).write_pdf("quotation.pdf")
✅ Step 6: Testing Your PoC
Internal Testing:
Test functionality end-to-end yourself first.
Pilot Test:
Find 1-2 MSMEs willing to test your software.
Take feedback actively to refine further iterations.
✅ Step 7: Feedback & Improvements
After Pilot Testing, Prioritize Feedback:
Identify gaps/issues.
Improve the ease of use of the UI.
Optimize backend performance.
  