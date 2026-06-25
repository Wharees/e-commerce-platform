import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const OrderDetailPage = () => {
  const { id } = useParams(); // Gets the /orders/:id from the URL
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        // Handle different backend response structures safely
        setOrder(response.data.order || response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details. It may not exist.");
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleConfirmReceipt = async () => {
    // A quick safety check so they don't click it by accident!
    if (!window.confirm("Are you sure you have received this order in good condition?")) return;
    
    setIsUpdating(true);
    try {
      const response = await api.put(`/orders/${id}/receive`);
      // Update the screen instantly with the newly delivered order data
      setOrder(response.data.order);
      alert("Success! Your order has been marked as Delivered. 🎉");
    } catch (err) {
      console.error("Failed to confirm receipt:", err);
      alert(err.response?.data?.message || "Failed to update status. Check console.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl font-semibold text-gray-600 animate-pulse">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="text-red-500 font-semibold bg-red-50 p-4 rounded-lg mb-4">{error}</div>
        <button onClick={() => navigate('/orders')} className="text-blue-600 font-bold hover:underline">
          &larr; Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <button onClick={() => navigate('/orders')} className="text-sm text-gray-500 hover:text-blue-600 mb-2 flex items-center gap-1">
            &larr; Back to Order History
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Order #{order.orderNumber || order._id.substring(0, 8).toUpperCase()}
          </h1>
          <p className="text-gray-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        {/* Status Badge */}
        <div>
          <span className={`px-4 py-2 text-sm font-bold rounded-full 
            ${order.isDelivered ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
            {order.isDelivered ? 'Delivered' : 'Processing'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-bold text-gray-800">Items Ordered</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item, index) => (
                <div key={index} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{item.name || 'Marketplace Item'}</h3>
                    <p className="text-gray-500 text-sm mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-bold text-gray-900">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4 border-b pb-2">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Items Total:</span>
                <span>₦{order.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-3 border-t text-gray-900">
                <span>Total:</span>
                <span>₦{order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4 border-b pb-2">Shipping Information</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{order.shippingAddress?.address || "Address not provided"}</p>
              <p>{order.shippingAddress?.city}{order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ""}</p>
              <p>{order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* 🎯 THE MAGIC BUTTON */}
          {!order.isDelivered && (
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-6 text-center">
              <h3 className="font-bold text-blue-900 mb-2">Have you received this?</h3>
              <p className="text-xs text-blue-700 mb-4">Only click this once the vendor has successfully delivered your items.</p>
              <button 
                onClick={handleConfirmReceipt}
                disabled={isUpdating}
                className={`w-full py-3 rounded-lg font-bold text-white transition shadow-sm
                  ${isUpdating ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isUpdating ? 'Updating...' : 'Confirm Receipt'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;