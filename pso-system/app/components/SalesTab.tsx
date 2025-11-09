"use client";
import React, { useState, useEffect, useRef } from "react";

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

export default function SalesTab() {
  const [customerName, setCustomerName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentSale, setCurrentSale] = useState<SaleItem[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  
  const searchRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedItems = localStorage.getItem("pos-items");
    const storedSettings = localStorage.getItem("pos-settings");
    if (storedItems) setItems(JSON.parse(storedItems));
    if (storedSettings) setSettings(JSON.parse(storedSettings));
    
    // Check for edit sale ID from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('editSale') || localStorage.getItem('editSaleId');
    if (editId) {
      loadSaleForEdit(editId);
      localStorage.removeItem('editSaleId');
    }
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.index.toString() === searchTerm
      );
      setFilteredItems(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredItems([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, items]);

  const addItemToSale = (item: Item, qty = quantity) => {
    const existingItem = currentSale.find(saleItem => saleItem.id === item.id);
    
    if (existingItem) {
      setCurrentSale(prev => prev.map(saleItem =>
        saleItem.id === item.id
          ? { ...saleItem, quantity: saleItem.quantity + qty, total: (saleItem.quantity + qty) * saleItem.price }
          : saleItem
      ));
    } else {
      const saleItem: SaleItem = {
        ...item,
        quantity: qty,
        total: item.price * qty
      };
      setCurrentSale(prev => [...prev, saleItem]);
    }
    
    setSearchTerm("");
    setQuantity(1);
    setShowSuggestions(false);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const exactMatch = items.find(item => 
        item.name.toLowerCase() === searchTerm.toLowerCase() ||
        item.index.toString() === searchTerm
      );
      
      if (exactMatch) {
        quantityRef.current?.focus();
        quantityRef.current?.select();
      }
    }
  };

  const handleQuantityKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const exactMatch = items.find(item => 
        item.name.toLowerCase() === searchTerm.toLowerCase() ||
        item.index.toString() === searchTerm
      );
      
      if (exactMatch) {
        addItemToSale(exactMatch, quantity);
        setTimeout(() => {
          searchRef.current?.focus();
        }, 100);
      }
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    
    setCurrentSale(prev => prev.map(item =>
      item.id === id
        ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
        : item
    ));
  };

  const removeItem = (id: string) => {
    setCurrentSale(prev => prev.filter(item => item.id !== id));
  };

  const getTotalAmount = () => {
    return currentSale.reduce((sum, item) => sum + item.total, 0);
  };

  const loadSaleForEdit = (saleId: string) => {
    const existingSales = JSON.parse(localStorage.getItem("pos-sales") || "[]");
    const saleToEdit = existingSales.find((sale: Sale) => sale.id === saleId);
    if (saleToEdit) {
      setCurrentSale(saleToEdit.items);
      setCustomerName(saleToEdit.customerName);
      setEditingSaleId(saleId);
    }
  };

  const completeSale = () => {
    if (currentSale.length === 0) return;
    
    const existingSales = JSON.parse(localStorage.getItem("pos-sales") || "[]");
    
    if (editingSaleId) {
      // Update existing sale
      const updatedSales = existingSales.map((sale: Sale) => 
        sale.id === editingSaleId 
          ? {
              ...sale,
              customerName: customerName || "Walk-in Customer",
              items: currentSale,
              total: getTotalAmount()
            }
          : sale
      );
      localStorage.setItem("pos-sales", JSON.stringify(updatedSales));
      setEditingSaleId(null);
    } else {
      // Create new sale
      const sale: Sale = {
        id: Date.now().toString(),
        customerName: customerName || "Walk-in Customer",
        items: currentSale,
        total: getTotalAmount(),
        date: new Date().toISOString()
      };
      localStorage.setItem("pos-sales", JSON.stringify([...existingSales, sale]));
    }
    
    setCurrentSale([]);
    setCustomerName("");
  };

  const printReceipt = () => {
    const receiptContent = generateReceiptContent();
    
    // Create hidden iframe for silent printing
    const printFrame = document.createElement('iframe');
    printFrame.style.display = 'none';
    printFrame.style.visibility = 'hidden';
    printFrame.style.position = 'fixed';
    printFrame.style.left = '-9999px';
    printFrame.style.top = '-9999px';
    printFrame.style.width = '0px';
    printFrame.style.height = '0px';
    printFrame.style.border = 'none';
    document.body.appendChild(printFrame);
    
    const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.write(receiptContent);
      frameDoc.close();
      
      // Force silent print
      printFrame.onload = () => {
        setTimeout(() => {
          try {
            printFrame.contentWindow?.focus();
            printFrame.contentWindow?.print();
          } catch (e) {
            // Silent fail
          }
          setTimeout(() => {
            if (document.body.contains(printFrame)) {
              document.body.removeChild(printFrame);
            }
          }, 2000);
        }, 100);
      };
    }
  };

  const generateReceiptContent = () => {
    const now = new Date();
    return `
      <html>
        <head>
          <title>Receipt</title>
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

            .right { text-align: right; }
            h2 { margin: 2mm 0; font-size: 16px; font-weight: 800; color: #000; }
            p { margin: 1mm 0; font-size: 12px; font-weight: 700; color: #000; }
            .logo { width: 80px; height: 80px; margin: 0 auto 3mm; }
            .no-break { page-break-inside: avoid; }
          </style>
        </head>
        <body>
          <div class="no-break">
            <div class="center">
              ${settings.logo ? `<img src="${settings.logo}" alt="Logo" class="logo" />` : ""}
              <h2>${settings.businessName || "POS System"}</h2>
              ${settings.address ? `<p>${settings.address}</p>` : ""}
              ${(settings.phone || settings.email) ? `<p>${settings.phone || ""} ${settings.phone && settings.email ? "|" : ""} ${settings.email || ""}</p>` : ""}
            </div>
            
            ${settings.headerText ? `<div class="center" style="margin: 3mm 0;"><p style="font-size: 14px; font-weight: 800; color: #000;">${settings.headerText}</p></div>` : ""}
            
            <div class="center" style="margin: 3mm 0;">
              <h2>CASH SALE INVOICE</h2>
            </div>
            
            <p style="color: #000; font-weight: 800;"><strong>Invoice No:</strong> INV-${Date.now().toString().slice(-4)}</p>
            <p style="color: #000; font-weight: 800;"><strong>Date:</strong> ${now.toLocaleDateString()} ${now.toLocaleTimeString()}</p>
            <p style="color: #000; font-weight: 800;"><strong>Customer:</strong> ${customerName || "Walk-in Customer"}</p>
            
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
              ${currentSale.map((item, index) => `
                <tr style="border-bottom: 1px solid #000; margin: 1mm 0;">
                  <td style="width: 8%; font-weight: 800; padding: 2mm 1mm; color: #000;">${index + 1}</td>
                  <td style="width: 40%; font-weight: 800; padding: 2mm 1mm; color: #000;">${item.name}</td>
                  <td style="width: 20%; text-align: center; padding: 2mm 1mm; color: #000; font-weight: 700;">${item.quantity} ${item.unit}</td>
                  <td style="width: 16%; text-align: right; padding: 2mm 1mm; color: #000; font-weight: 700;"> ${item.price.toFixed(2)}</td>
                  <td style="width: 16%; text-align: right; font-weight: 800; padding: 2mm 1mm; color: #000;"> ${item.total.toFixed(2)}</td>
                </tr>
              `).join("")}
            </table>
            
            <div class="dashed-line"></div>
            
            <table>
              <tr>
                <td style="font-size: 14px; font-weight: 800; color: #000;"><strong>TOTAL AMOUNT:</strong></td>
                <td class="right" style="font-size: 15px; font-weight: 800; color: #000;"><strong>${settings.currency || 'PKR'} ${getTotalAmount().toFixed(2)}</strong></td>
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
      {/* Add Item Form */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex-1 relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Item</label>
            <input
              ref={searchRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder="Name or index number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            
            {showSuggestions && filteredItems.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      addItemToSale(item);
                      setTimeout(() => quantityRef.current?.focus(), 100);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">#{item.index} - {settings.currency || 'PKR'} {item.price} per {item.unit}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="w-24">
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              ref={quantityRef}
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              onKeyPress={handleQuantityKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <button
            onClick={() => {
              const exactMatch = items.find(item => 
                item.name.toLowerCase() === searchTerm.toLowerCase() ||
                item.index.toString() === searchTerm
              );
              if (exactMatch) addItemToSale(exactMatch);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Add Item
          </button>
        </div>
      </div>

      {/* Current Sale */}
      {currentSale.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Current Sale</h3>
          <div className="space-y-2">
            {currentSale.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">PKR {item.price} per {item.unit}</div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                  />
                  <span className="w-20 text-right font-medium">PKR {item.total.toFixed(2)}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span>PKR {getTotalAmount().toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mt-4 flex gap-3">
            <button
              onClick={completeSale}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {editingSaleId ? 'Update Sale' : 'Complete Sale'}
            </button>
            <button
              onClick={printReceipt}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}