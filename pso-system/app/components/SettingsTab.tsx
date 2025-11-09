"use client";
import { useState, useEffect, useRef } from "react";

interface BusinessSettings {
  businessName: string;
  ownerName: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
}

export default function SettingsTab() {
  const [settings, setSettings] = useState<BusinessSettings>({
    businessName: "",
    ownerName: "",
    address: "",
    phone: "",
    email: "",
    logo: ""
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
        logo: ""
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