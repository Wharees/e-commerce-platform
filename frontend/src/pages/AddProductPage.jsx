import React, { useState } from 'react';
import api from '../utils/api';
import { useAuthStore } from '../store/store';

const AddProductPage = () => {
  const { user } = useAuthStore();
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: ''
  });
  const [status, setStatus] = useState({ loading: false, message: '', error: '' });

  // --- 1. NEW IMAGE STATE ADDED HERE ---
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  if (!user || user.role !== 'vendor') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-600">Only vendors are allowed to add new products.</p>
      </div>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // --- 2. NEW IMAGE HANDLER ADDED HERE ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, message: '', error: '' });

    try {
      // --- STEP 1: Send the text data to create the product ---
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity, 10),
        category: form.category
      };

      const response = await api.post('/products/add', payload);
      
      // Grab the newly created product's ID from the database response
      const newProductId = response.data.product._id; 

      // --- STEP 2: Upload the image (if the vendor selected one) ---
      if (imageFile) {
        const formData = new FormData();
        
        // We use 'images' here because your backend expects req.files (an array)
        formData.append('images', imageFile); 

        // Send the image to the specific upload route for this new product
        // NOTE: Notice the headers have been removed here!
        await api.post(`/products/${newProductId}/images`, formData);
      }

      // Success! Clear the form and show the green message
      setStatus({ loading: false, message: 'Product and image published successfully!', error: '' });
      setForm({ name: '', description: '', price: '', quantity: '', category: '' });
      setImageFile(null);
      setImagePreview(null);
      
    } catch (error) {
      console.error("Upload error:", error.response || error);
      setStatus({
        loading: false,
        message: '',
        error: error.response?.data?.message || 'Unable to publish product. Please try again.'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-sm">
        
        {/* --- 3. NEW IMAGE UPLOAD UI ADDED HERE --- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition relative group cursor-pointer">
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleImageChange}
              accept="image/png, image/jpeg, image/jpg"
            />
            <div className="space-y-2 text-center">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="mx-auto h-32 w-auto object-cover rounded-md shadow-sm" 
                />
              ) : (
                <>
                  <svg className="mx-auto h-10 w-10 text-gray-400 group-hover:text-lasu-green transition" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <span className="relative font-medium text-gray-700 group-hover:text-lasu-green">
                      Click to upload image
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </>
              )}
            </div>
          </div>
          {imagePreview && (
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Remove image
            </button>
          )}
        </div>
        {/* --- END OF IMAGE UPLOAD UI --- */}

        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lasu-green-500 focus:ring-lasu-green-500 py-2 px-3 border"
            placeholder="Enter product name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lasu-green-500 focus:ring-lasu-green-500 py-2 px-3 border"
            placeholder="Write a short description"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lasu-green-500 focus:ring-lasu-green-500 py-2 px-3 border"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
            <input
              name="quantity"
              type="number"
              min="0"
              value={form.quantity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lasu-green-500 focus:ring-lasu-green-500 py-2 px-3 border"
              placeholder="0"
              required
            />
          </div>
        </div>

       <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-lasu-green-500 focus:ring-lasu-green-500 py-2 px-3 border"
            required
            >
              <option value="">-- Select a Category --</option>
              <option value="6a3a78e9c469afa8c1139c40">Clothes</option>
              <option value="6a3a79fbc469afa8c1139c41">Electronics</option>
              <option value="6a3a7b8bc469afa8c1139c45">Books</option>
              <option value="6a3a7b1bc469afa8c1139c44">Services</option>
            </select>
          </div>

        {status.message && <div className="rounded-md bg-green-50 p-4 text-green-700">{status.message}</div>}
        {status.error && <div className="rounded-md bg-red-50 p-4 text-red-700">{status.error}</div>}

        <button
          type="submit"
          disabled={status.loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {status.loading ? 'Listing Product...' : 'Publish Product'}
        </button>
      </form>
    </div>
  );
};

export default AddProductPage;