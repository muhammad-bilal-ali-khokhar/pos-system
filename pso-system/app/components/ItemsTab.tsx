"use client";
import { useState, useEffect } from "react";

interface Item {
  id: string;
  name: string;
  price: number;
  category: string;
  unit: string;
  index: number;
}

interface Category {
  id: string;
  name: string;
}

export default function ItemsTab() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    unit: "piece"
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const units = ["kg", "gram", "liter", "ml", "piece", "dozen", "box", "pack"];

  useEffect(() => {
    const storedItems = localStorage.getItem("pos-items");
    const storedCategories = localStorage.getItem("pos-categories");
    
    if (storedItems) setItems(JSON.parse(storedItems));
    if (storedCategories) setCategories(JSON.parse(storedCategories));
  }, []);

  const saveItems = (newItems: Item[]) => {
    setItems(newItems);
    localStorage.setItem("pos-items", JSON.stringify(newItems));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      alert("Please fill in all required fields");
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      alert("Please enter a valid price");
      return;
    }

    if (editingId) {
      const updatedItems = items.map(item =>
        item.id === editingId
          ? { ...item, name: formData.name, price, category: formData.category, unit: formData.unit }
          : item
      );
      saveItems(updatedItems);
      setEditingId(null);
    } else {
      const newItem: Item = {
        id: Date.now().toString(),
        name: formData.name,
        price,
        category: formData.category,
        unit: formData.unit,
        index: items.length + 1
      };
      saveItems([...items, newItem]);
    }

    setFormData({ name: "", price: "", category: "", unit: "piece" });
  };

  const editItem = (item: Item) => {
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      unit: item.unit
    });
    setEditingId(item.id);
  };

  const deleteItem = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      const updatedItems = items.filter(item => item.id !== id);
      // Reindex items
      const reindexedItems = updatedItems.map((item, index) => ({
        ...item,
        index: index + 1
      }));
      saveItems(reindexedItems);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", price: "", category: "", unit: "piece" });
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Add/Edit Item Form */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {editingId ? "Edit Item" : "Add New Item"}
        </h3>
        
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter item name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {units.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {editingId ? "Update" : "Add"} Item
            </button>
            
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search items by name or category..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Items List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h3 className="text-lg font-medium text-gray-900">Items ({filteredItems.length})</h3>
        </div>
        
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {items.length === 0 ? "No items added yet" : "No items match your search"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-500">#{item.index}</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">${item.price.toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{item.category}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{item.unit}</td>
                    <td className="px-4 py-2 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editItem(item)}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}