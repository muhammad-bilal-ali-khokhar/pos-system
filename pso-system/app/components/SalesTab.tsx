"use client";
import { useState, useEffect, useRef } from "react";

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
  
  const searchRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedItems = localStorage.getItem("pos-items");
    const storedSettings = localStorage.getItem("pos-settings");
    if (storedItems) setItems(JSON.parse(storedItems));
    if (storedSettings) setSettings(JSON.parse(storedSettings));
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
        addItemToSale(exactMatch, 1);
        quantityRef.current?.focus();
      }
    }
  };

  const handleQuantityKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchTerm) {
      const exactMatch = items.find(item => 
        item.name.toLowerCase() === searchTerm.toLowerCase() ||
        item.index.toString() === searchTerm
      );
      
      if (exactMatch) {
        addItemToSale(exactMatch, quantity);
        searchRef.current?.focus();
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

  const completeSale = () => {
    if (currentSale.length === 0) return;
    
    const sale: Sale = {
      id: Date.now().toString(),
      customerName: customerName || "Walk-in Customer",
      items: currentSale,
      total: getTotalAmount(),
      date: new Date().toISOString()
    };
    
    const existingSales = JSON.parse(localStorage.getItem("pos-sales") || "[]");
    localStorage.setItem("pos-sales", JSON.stringify([...existingSales, sale]));
    
    setCurrentSale([]);
    setCustomerName("");
    alert("Sale completed successfully!");
  };

  const printReceipt = () => {
    const receiptContent = generateReceiptContent();
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generateReceiptContent = () => {
    const now = new Date();
    return `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: monospace; width: 300px; margin: 0; padding: 20px; }
            .center { text-align: center; }
            .line { border-bottom: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 2px 0; }
            .right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="center">
            <h2>${settings.businessName || "POS System"}</h2>
            <p>${settings.address || ""}</p>
            <p>${settings.phone || ""} | ${settings.email || ""}</p>
          </div>
          <div class="line"></div>
          <p>Date: ${now.toLocaleDateString()}</p>
          <p>Time: ${now.toLocaleTimeString()}</p>
          <p>Customer: ${customerName || "Walk-in Customer"}</p>
          <div class="line"></div>
          <table>
            ${currentSale.map(item => `
              <tr>
                <td>${item.name}</td>
                <td class="right">${item.quantity} ${item.unit}</td>
              </tr>
              <tr>
                <td>@ $${item.price.toFixed(2)}</td>
                <td class="right">$${item.total.toFixed(2)}</td>
              </tr>
            `).join("")}
          </table>
          <div class="line"></div>
          <table>
            <tr>
              <td><strong>TOTAL</strong></td>
              <td class="right"><strong>$${getTotalAmount().toFixed(2)}</strong></td>
            </tr>
          </table>
          <div class="line"></div>
          <div class="center">
            <p>Thank you for your business!</p>
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
                    onClick={() => addItemToSale(item)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">#{item.index} - ${item.price} per {item.unit}</div>
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
            disabled={!searchTerm}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>

      {/* Current Sale */}
      {currentSale.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h3 className="text-lg font-medium text-gray-900">Current Sale</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentSale.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">{item.unit}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">${item.price.toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">${item.total.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-4 py-3 bg-gray-50 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium text-gray-900">Total: ${getTotalAmount().toFixed(2)}</span>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={completeSale}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Complete Sale
              </button>
              <button
                onClick={printReceipt}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}