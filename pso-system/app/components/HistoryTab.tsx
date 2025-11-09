"use client";
import React, { useState, useEffect } from "react";

interface Item {
  id: string;
  name: string;
  price: number;
  category: string;
  unit: string;
  index: number;
}

interface SaleItem extends Item {
  quantity: number;
  total: number;
}

interface Sale {
  id: string;
  customerName: string;
  items: SaleItem[];
  total: number;
  date: string;
}

export default function HistoryTab() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);

  useEffect(() => {
    const storedSales = localStorage.getItem("pos-sales");
    const storedSettings = localStorage.getItem("pos-settings");
    if (storedSales) setSales(JSON.parse(storedSales));
    if (storedSettings) setSettings(JSON.parse(storedSettings));
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = sales.filter(sale => 
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.includes(searchTerm) ||
        new Date(sale.date).toLocaleDateString().includes(searchTerm)
      );
      setFilteredSales(filtered);
    } else {
      setFilteredSales(sales);
    }
  }, [searchTerm, sales]);

  const printReceipt = (sale: Sale) => {
    // Remove any existing print frames
    const existingFrames = document.querySelectorAll('iframe[data-print-frame]');
    existingFrames.forEach(frame => frame.remove());
    
    const receiptContent = generateReceiptContent(sale);
    
    // Create completely hidden iframe
    const printFrame = document.createElement('iframe');
    printFrame.setAttribute('data-print-frame', 'true');
    printFrame.style.position = 'absolute';
    printFrame.style.left = '-10000px';
    printFrame.style.top = '-10000px';
    printFrame.style.width = '1px';
    printFrame.style.height = '1px';
    printFrame.style.opacity = '0';
    printFrame.style.border = 'none';
    printFrame.style.visibility = 'hidden';
    printFrame.style.display = 'none';
    document.body.appendChild(printFrame);
    
    const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.write(receiptContent);
      frameDoc.close();
      
      // Immediate silent print
      setTimeout(() => {
        try {
          printFrame.contentWindow?.print();
        } catch (e) {
          // Silent fail
        }
        setTimeout(() => {
          if (document.body.contains(printFrame)) {
            document.body.removeChild(printFrame);
          }
        }, 1000);
      }, 300);
    }
  };

  const editSale = (saleId: string) => {
    localStorage.setItem('editSaleId', saleId);
    window.location.reload();
  };

  const deleteSale = (saleId: string) => {
    if (confirm('Are you sure you want to delete this sale?')) {
      const updatedSales = sales.filter(sale => sale.id !== saleId);
      setSales(updatedSales);
      localStorage.setItem('pos-sales', JSON.stringify(updatedSales));
    }
  };

  const generateReceiptContent = (sale: Sale) => {
    const saleDate = new Date(sale.date);
    const invoiceNo = `INV-${sale.id.slice(-4)}`;
    return `
      <html>
        <head>
          <title>Invoice</title>
          <style>
            @page { 
              margin: 0; 
              size: 80mm auto;
              -webkit-print-color-adjust: exact;
            }
            @media print {
              html, body { 
                height: auto !important;
                overflow: visible !important;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            html, body { 
              margin: 0; 
              padding: 0; 
              height: auto;
              overflow: visible;
            }
            body { 
              font-family: 'Courier New', monospace; 
              width: 72mm; 
              padding: 3mm; 
              font-size: 12px; 
              line-height: 1.5;
              color: #000;
              background: #fff;
              font-weight: 700;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .line { 
              border-bottom: 1px solid #000; 
              margin: 1mm 0;
              content: '';
              display: block;
            }
            .dashed-line {
              border-bottom: 1px dashed #000;
              margin: 1mm 0;
            }
            table { width: 100%; border-collapse: collapse; margin: 0; }
            th, td { 
              padding: 3mm 2mm; 
              vertical-align: top; 
              font-size: 12px;
              border-bottom: 1px solid #000;
              font-weight: 700;
              color: #000;
            }
            th { font-weight: 800; color: #000; }
            h2 { margin: 2mm 0; font-size: 16px; font-weight: 800; color: #000; }
            p { margin: 1mm 0; font-size: 12px; font-weight: 700; color: #000; }
            .logo { width: 100px; height: 100px; margin: 0 auto 3mm; }
            .no-break { page-break-inside: avoid; }
          </style>
        </head>
        <body>
          <div class="no-break">
            <div class="center">
              ${settings.logo ? `<img src="${settings.logo}" alt="Logo" class="logo" />` : ""}
              <h2 style="font-weight: 800; color: #000;">${settings.businessName || "POS System"}</h2>
              ${settings.address ? `<p style="color: #000; font-weight: 700;">${settings.address}</p>` : ""}
              ${(settings.phone || settings.email) ? `<p style="color: #000; font-weight: 700;">${settings.phone || ""} ${settings.phone && settings.email ? "|" : ""} ${settings.email || ""}</p>` : ""}
            </div>
            
            ${settings.headerText ? `<div class="center" style="margin: 3mm 0;"><p style="font-size: 14px; font-weight: 800; color: #000;">${settings.headerText}</p></div>` : ""}
            
            <div class="center" style="margin: 3mm 0;">
              <h2>CASH SALE INVOICE</h2>
            </div>
            
            <p style="color: #000; font-weight: 800;"><strong>Invoice No:</strong> ${invoiceNo}</p>
            <p style="color: #000; font-weight: 800;"><strong>Date:</strong> ${saleDate.toLocaleDateString()} ${saleDate.toLocaleTimeString()}</p>
            <p style="color: #000; font-weight: 800;"><strong>Customer:</strong> ${sale.customerName}</p>
            
            <div class="dashed-line"></div>
            
            <table>
              <tr>
                <th style="width: 8%"><strong>#</strong></th>
                <th style="width: 40%"><strong>ITEM NAME</strong></th>
                <th style="width: 20%"><strong>QTY</strong></th>
                <th style="width: 16%"><strong>PRICE</strong></th>
                <th style="width: 16%" class="right"><strong>AMOUNT</strong></th>
              </tr>
            </table>
            
            <div class="dashed-line"></div>
            
            <table>
              ${sale.items.map((item, index) => `
                <tr style="border-bottom: 1px solid #000; margin: 1mm 0;">
                  <td style="width: 8%; font-weight: 800; padding: 2mm 1mm; color: #000;">${index + 1}</td>
                  <td style="width: 40%; font-weight: 800; padding: 2mm 1mm; color: #000;">${item.name}</td>
                  <td style="width: 20%; text-align: center; padding: 2mm 1mm; color: #000; font-weight: 700;">${item.quantity} ${item.unit}</td>
                  <td style="width: 16%; text-align: right; padding: 2mm 1mm; color: #000; font-weight: 700;">${item.price.toFixed(2)}</td>
                  <td style="width: 16%; text-align: right; font-weight: 800; padding: 2mm 1mm; color: #000;">${item.total.toFixed(2)}</td>
                </tr>
              `).join("")}
            </table>
            
            <div class="dashed-line"></div>
            
            <table>
              <tr>
                <td style="font-size: 14px; font-weight: 800; color: #000;"><strong>TOTAL AMOUNT:</strong></td>
                <td class="right" style="font-size: 15px; font-weight: 800; color: #000;"><strong>${settings.currency || 'PKR'} ${sale.total.toFixed(2)}</strong></td>
              </tr>
            </table>
            
            <div class="dashed-line"></div>
            
            <div class="center" style="margin: 3mm 0;">
              <p style="font-size: 14px; font-weight: 800; color: #000;"><strong>${settings.thankYouText || "Thank you for your business!"}</strong></p>
              <p style="font-size: 12px; color: #000; font-weight: 700;">${settings.visitAgainText || "Visit us again"}</p>
              ${settings.footerText ? `<p style="font-size: 12px; color: #000; font-weight: 700; margin-top: 2mm;">${settings.footerText}</p>` : ""}
            </div>
            ${settings.footerLogo || settings.paymentQR ? `
              <div class="center" style="margin-top: 2mm;">
                ${settings.footerLogo ? `<img src="${settings.footerLogo}" alt="Footer Logo" style="width: 60px; height: 60px; margin: 2mm auto;" />` : ""}
                ${settings.paymentQR ? `<img src="${settings.paymentQR}" alt="Payment QR" style="width: 80px; height: 80px; margin: 2mm auto; display: block;" />` : ""}
                ${settings.paymentText ? `<p style="font-size: 11px; margin: 1mm 0; font-weight: 800; color: #000;">${settings.paymentText}</p>` : ""}
              </div>
            ` : ""}
          </div>
        </body>
      </html>
    `;
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Sales</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Customer name, receipt ID, or date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Sales History */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h3 className="text-lg font-medium text-gray-900">Sales History ({filteredSales.length})</h3>
        </div>
        
        {filteredSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {new Date(sale.date).toLocaleDateString()}<br/>
                      <span className="text-xs text-gray-500">{new Date(sale.date).toLocaleTimeString()}</span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{sale.customerName}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {sale.items.length} item{sale.items.length > 1 ? 's' : ''}
                      <div className="text-xs">
                        {sale.items.slice(0, 2).map(item => item.name).join(', ')}
                        {sale.items.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">PKR {sale.total.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => printReceipt(sale)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Print
                        </button>
                        <button
                          onClick={() => editSale(sale.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteSale(sale.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-8 text-center text-gray-500">
            {searchTerm ? 'No sales found matching your search.' : 'No sales history available.'}
          </div>
        )}
      </div>
    </div>
  );
}