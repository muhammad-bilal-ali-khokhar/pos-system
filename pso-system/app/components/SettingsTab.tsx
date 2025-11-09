"use client";
import { useState, useEffect, useRef } from "react";

interface BusinessSettings {
  businessName: string;
  ownerName: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
  footerLogo: string;
  paymentQR: string;
  paymentText: string;
  receiptLayout: string;
  currency: string;
  headerText: string;
  footerText: string;
  thankYouText: string;
  visitAgainText: string;
}

export default function SettingsTab() {
  const [settings, setSettings] = useState<BusinessSettings>({
    businessName: "",
    ownerName: "",
    address: "",
    phone: "",
    email: "",
    logo: "",
    footerLogo: "",
    paymentQR: "",
    paymentText: "",
    receiptLayout: "layout1",
    currency: "PKR",
    headerText: "",
    footerText: "",
    thankYouText: "Thank you for your business!",
    visitAgainText: "Visit us again"
  });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedSettings = localStorage.getItem("pos-settings");
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  const handleInputChange = (field: keyof BusinessSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSettings(prev => ({
          ...prev,
          logo: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setSettings(prev => ({
      ...prev,
      logo: ""
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const saveSettings = () => {
    setIsLoading(true);
    
    // Simulate saving delay
    setTimeout(() => {
      localStorage.setItem("pos-settings", JSON.stringify(settings));
      setIsLoading(false);
      alert("Settings saved successfully!");
    }, 500);
  };

  const resetSettings = () => {
    if (confirm("Are you sure you want to reset all settings? This action cannot be undone.")) {
      const defaultSettings: BusinessSettings = {
        businessName: "",
        ownerName: "",
        address: "",
        phone: "",
        email: "",
        logo: "",
        footerLogo: "",
        paymentQR: "",
        paymentText: "",
        receiptLayout: "standard",
        headerText: "",
        footerText: "",
        thankYouText: "Thank you for your business!",
        visitAgainText: "Visit us again"
      };
      setSettings(defaultSettings);
      localStorage.removeItem("pos-settings");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Business Logo Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Logo</h3>
        
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            {settings.logo ? (
              <div className="relative">
                <img
                  src={settings.logo}
                  alt="Business Logo"
                  className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                />
                <button
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                  title="Remove logo"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-xs text-center">No Logo</span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              📁 Upload Logo
            </label>
            <p className="mt-2 text-sm text-gray-500">
              Upload your business logo (max 2MB, JPG/PNG)
            </p>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name *
            </label>
            <input
              type="text"
              value={settings.businessName}
              onChange={(e) => handleInputChange("businessName", e.target.value)}
              placeholder="Enter your business name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Owner Name
            </label>
            <input
              type="text"
              value={settings.ownerName}
              onChange={(e) => handleInputChange("ownerName", e.target.value)}
              placeholder="Enter owner name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={settings.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter business address"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Enter phone number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {(settings.businessName || settings.logo) && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Receipt Preview</h3>
          
          <div className="max-w-sm mx-auto bg-gray-50 p-4 rounded-lg border">
            <div className="text-center space-y-2">
              {settings.logo && (
                <img
                  src={settings.logo}
                  alt="Logo"
                  className="w-16 h-16 object-cover mx-auto rounded"
                />
              )}
              
              {settings.businessName && (
                <h4 className="font-bold text-lg">{settings.businessName}</h4>
              )}
              
              {settings.address && (
                <p className="text-sm text-gray-600">{settings.address}</p>
              )}
              
              {(settings.phone || settings.email) && (
                <p className="text-sm text-gray-600">
                  {settings.phone} {settings.phone && settings.email && "|"} {settings.email}
                </p>
              )}
              
              <div className="border-t border-dashed border-gray-400 my-2"></div>
              <p className="text-xs text-gray-500">This is how your business info will appear on receipts</p>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Footer Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Receipt Footer (Optional)</h3>
        
        <div className="space-y-6">
          {/* Footer Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Footer Logo/Image</label>
            <div className="flex items-center gap-4">
              {settings.footerLogo ? (
                <div className="relative">
                  <img src={settings.footerLogo} alt="Footer Logo" className="w-12 h-12 object-cover rounded border" />
                  <button
                    onClick={() => handleInputChange("footerLogo", "")}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Logo</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      handleInputChange("footerLogo", event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          {/* Payment QR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment QR Code</label>
            <div className="flex items-center gap-4">
              {settings.paymentQR ? (
                <div className="relative">
                  <img src={settings.paymentQR} alt="Payment QR" className="w-16 h-16 object-cover rounded border" />
                  <button
                    onClick={() => handleInputChange("paymentQR", "")}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-xs">QR</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      handleInputChange("paymentQR", event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          {/* Payment Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Online Payment Text</label>
            <input
              type="text"
              value={settings.paymentText}
              onChange={(e) => handleInputChange("paymentText", e.target.value)}
              placeholder="e.g., Scan QR for online payment"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          {/* Receipt Layout */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Layout</label>
            <select
              value={settings.receiptLayout}
              onChange={(e) => handleInputChange("receiptLayout", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="layout1">Modern Clean</option>
              <option value="layout2">Professional Table</option>
              <option value="layout3">Minimal Simple</option>
              <option value="layout4">Dark Header</option>
              <option value="layout5">Elegant Boutique</option>
              <option value="layout6">Boxed Corporate</option>
              <option value="layout7">Gradient Premium</option>
              <option value="layout8">Bold Impact</option>
              <option value="layout9">Luxury Gold</option>
              <option value="layout10">Retro Classic</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">Choose your preferred receipt format</p>
            
            {/* Layout Preview */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
              <div className="bg-white p-3 rounded border" style={{maxWidth: '250px', fontSize: '10px', fontFamily: 'monospace'}}>
                {settings.receiptLayout === 'layout1' && (
                  <div className="text-center">
                    <div className="font-bold">BUSINESS NAME</div>
                    <div>Address Line</div>
                    <div>Tel: Phone</div>
                    <hr className="my-2" />
                    <div className="font-bold">CASH INVOICE</div>
                    <div>Invoice: INV-1234</div>
                    <div>Date: 01/01/2024</div>
                    <div>Customer: Sample</div>
                    <hr className="my-2" />
                    <div className="flex justify-between">
                      <span>1. Item Name</span>
                    </div>
                    <div className="flex justify-between">
                      <span>2 kg × {settings.currency || 'PKR'} 100.00</span>
                      <span>{settings.currency || 'PKR'} 200.00</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>TOTAL:</span>
                      <span>{settings.currency || 'PKR'} 200.00</span>
                    </div>
                    <hr className="my-2" />
                    <div className="font-bold">Thank you!</div>
                  </div>
                )}
                
                {settings.receiptLayout === 'layout2' && (
                  <div>
                    <div className="text-center font-bold">BUSINESS NAME</div>
                    <div className="text-xs">Invoice: INV-1234 | Date: 01/01/2024</div>
                    <table className="w-full text-xs mt-2">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left">#</th>
                          <th className="text-left">Item</th>
                          <th>Qty</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>Sample Item</td>
                          <td>2</td>
                          <td>{settings.currency || 'PKR'} 200</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="text-right font-bold mt-2">TOTAL: {settings.currency || 'PKR'} 200.00</div>
                    <div className="text-center mt-2"><strong>Thank you!</strong></div>
                  </div>
                )}
                
                {settings.receiptLayout === 'layout3' && (
                  <div>
                    <div className="text-center">
                      <h3 className="font-bold">STORE</h3>
                    </div>
                    <hr className="border-2 border-black my-2" />
                    <div>Receipt: INV-1234</div>
                    <div>Date: 01/01/2024</div>
                    <div>Customer: Guest</div>
                    <hr className="border-2 border-black my-2" />
                    <div>1. Sample Item</div>
                    <div>2 × {settings.currency || 'PKR'} 100.00 = {settings.currency || 'PKR'} 200.00</div>
                    <hr className="border-2 border-black my-2" />
                    <div className="text-center font-bold">TOTAL: {settings.currency || 'PKR'} 200.00</div>
                    <div className="text-center">Thank You!</div>
                  </div>
                )}
                
                {(settings.receiptLayout === 'layout4' || !settings.receiptLayout || 
                  !['layout1', 'layout2', 'layout3'].includes(settings.receiptLayout)) && (
                  <div>
                    <div className="bg-gray-800 text-white p-2 text-center">
                      <div className="font-bold">BUSINESS</div>
                    </div>
                    <div className="p-2">
                      <div><strong>Invoice:</strong> INV-1234</div>
                      <div><strong>Date:</strong> 01/01/2024</div>
                      <div><strong>Customer:</strong> Customer</div>
                      <hr className="my-2" />
                      <div className="bg-white p-1 rounded border">
                        <strong>1. Sample Item</strong><br/>
                        <div>2 kg @ {settings.currency || 'PKR'} 100.00 = <strong>{settings.currency || 'PKR'} 200.00</strong></div>
                      </div>
                      <hr className="my-2" />
                      <div className="text-center font-bold">TOTAL: {settings.currency || 'PKR'} 200.00</div>
                      <div className="text-center mt-2"><strong>Thank You for Your Business!</strong></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Header Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Header Text</label>
            <input
              type="text"
              value={settings.headerText}
              onChange={(e) => handleInputChange("headerText", e.target.value)}
              placeholder="e.g., Welcome to our store!"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-sm text-gray-500 mt-1">Optional text to show at top of receipt</p>
          </div>
          
          {/* Thank You Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thank You Message</label>
            <input
              type="text"
              value={settings.thankYouText}
              onChange={(e) => handleInputChange("thankYouText", e.target.value)}
              placeholder="Thank you for your business!"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-sm text-gray-500 mt-1">Main thank you message on receipt</p>
          </div>
          
          {/* Visit Again Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Visit Again Message</label>
            <input
              type="text"
              value={settings.visitAgainText}
              onChange={(e) => handleInputChange("visitAgainText", e.target.value)}
              placeholder="Visit us again"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-sm text-gray-500 mt-1">Secondary message below thank you</p>
          </div>
          
          {/* Footer Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Footer Text</label>
            <input
              type="text"
              value={settings.footerText}
              onChange={(e) => handleInputChange("footerText", e.target.value)}
              placeholder="e.g., Have a great day!"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-sm text-gray-500 mt-1">Optional text to show at bottom of receipt</p>
          </div>
          
          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => handleInputChange("currency", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="PKR">PKR - Pakistani Rupee</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
              <option value="AED">AED - UAE Dirham</option>
              <option value="SAR">SAR - Saudi Riyal</option>
              <option value="QAR">QAR - Qatari Riyal</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">Select your business currency</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <button
            onClick={resetSettings}
            className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
          >
            Reset All Settings
          </button>
          
          <button
            onClick={saveSettings}
            disabled={isLoading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Tips</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Business name will appear on all receipts and is required</li>
          <li>• Logo should be square format for best results</li>
          <li>• All information can be edited anytime</li>
          <li>• Settings are automatically saved to your browser</li>
        </ul>
      </div>
    </div>
  );
}