"use client";
import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
}

export default function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const storedCategories = localStorage.getItem("pos-categories");
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    }
  }, []);

  const saveCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
    localStorage.setItem("pos-categories", JSON.stringify(newCategories));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      alert("Please enter a category name");
      return;
    }

    // Check for duplicate names
    const existingCategory = categories.find(cat => 
      cat.name.toLowerCase() === categoryName.trim().toLowerCase() && cat.id !== editingId
    );
    
    if (existingCategory) {
      alert("Category name already exists");
      return;
    }

    if (editingId) {
      // Update existing category
      const updatedCategories = categories.map(category =>
        category.id === editingId
          ? { ...category, name: categoryName.trim() }
          : category
      );
      saveCategories(updatedCategories);
      setEditingId(null);
    } else {
      // Add new category
      const newCategory: Category = {
        id: Date.now().toString(),
        name: categoryName.trim()
      };
      saveCategories([...categories, newCategory]);
    }

    setCategoryName("");
  };

  const editCategory = (category: Category) => {
    setCategoryName(category.name);
    setEditingId(category.id);
  };

  const deleteCategory = (id: string) => {
    // Check if category is being used by any items
    const storedItems = localStorage.getItem("pos-items");
    if (storedItems) {
      const items = JSON.parse(storedItems);
      const categoryInUse = items.some((item: any) => {
        const categoryToDelete = categories.find(cat => cat.id === id);
        return item.category === categoryToDelete?.name;
      });
      
      if (categoryInUse) {
        alert("Cannot delete category that is being used by items");
        return;
      }
    }

    if (confirm("Are you sure you want to delete this category?")) {
      const updatedCategories = categories.filter(category => category.id !== id);
      saveCategories(updatedCategories);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCategoryName("");
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Category Form */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {editingId ? "Edit Category" : "Add New Category"}
        </h3>
        
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name (e.g., Fruits, Vegetables, Dairy)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {editingId ? "Update" : "Add"} Category
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

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h3 className="text-lg font-medium text-gray-900">Categories ({categories.length})</h3>
        </div>
        
        {categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="mb-4">
              <span className="text-4xl">🗂️</span>
            </div>
            <p className="text-lg mb-2">No categories added yet</p>
            <p className="text-sm">Add your first category to organize your items</p>
            <div className="mt-4 text-xs text-gray-400">
              <p>Example categories: Fruits, Vegetables, Dairy, Bakery, Beverages, Snacks</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-medium text-sm">
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{category.name}</h4>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => editCategory(category)}
                      className="text-indigo-600 hover:text-indigo-800 p-1"
                      title="Edit category"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete category"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Add Suggestions */}
      {categories.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Quick Start Suggestions</h4>
          <p className="text-blue-700 text-sm mb-3">
            Here are some common categories to get you started:
          </p>
          <div className="flex flex-wrap gap-2">
            {["Fruits", "Vegetables", "Dairy", "Bakery", "Beverages", "Snacks", "Meat", "Seafood"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setCategoryName(suggestion)}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}