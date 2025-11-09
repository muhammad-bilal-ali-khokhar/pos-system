"use client";
import { useState } from "react";
import SalesTab from "./components/SalesTab";
import ItemsTab from "./components/ItemsTab";
import CategoriesTab from "./components/CategoriesTab";
import SettingsTab from "./components/SettingsTab";

type Tab = "sales" | "items" | "categories" | "settings";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("sales");

  const tabs = [
    { id: "sales" as Tab, label: "💵 Sales", icon: "💵" },
    { id: "items" as Tab, label: "🛒 Items", icon: "🛒" },
    { id: "categories" as Tab, label: "🗂️ Categories", icon: "🗂️" },
    { id: "settings" as Tab, label: "⚙️ Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "sales" && <SalesTab />}
        {activeTab === "items" && <ItemsTab />}
        {activeTab === "categories" && <CategoriesTab />}
        {activeTab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}
