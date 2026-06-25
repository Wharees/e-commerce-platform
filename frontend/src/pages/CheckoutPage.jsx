import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/store';
import api from '../utils/api'; // 👈 Crucial: Talks to your backend

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { total, items } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const reference = `LASU-${Date.now().toString().slice(-6)}`;
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // 1. Send the exact data your backend controller is asking for
      const response = await api.post('/orders', {
        shippingAddress: {
          address: "LASU Main Campus",
          city: "Ojo",
          state: "Lagos",
          country: "Nigeria",
          phone: "08000000000"
        },
        paymentMethod: 'paystack'
      });

      // 2. IF the backend succeeds, THEN we route to the success page
      setIsProcessing(false);
      navigate('/order-success', { 
        state: { 
          reference: reference,
          itemsCount: items.length,
          total: total
        } 
      });
      
    } catch (error) {
      setIsProcessing(false);
      console.error("Order failed:", error.response?.data || error.message);
      // This will pop up and tell us exactly WHY the backend rejected it
      alert(error.response?.data?.message || "Failed to create order. Is your backend cart empty?");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 flex justify-center items-start">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mt-10">
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Payment</h2>
        <p className="text-gray-500 text-sm mb-6">Review your order and confirm payment</p>

        <div className="bg-blue-50/50 border-l-4 border-blue-600 rounded-r-xl p-5 mb-8">
          <h3 className="font-bold text-lg text-gray-800 mb-4">LASU Commerce Order</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Date:</span>
              <span className="text-gray-900">{today}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Items:</span>
              <span className="text-gray-900">{items.length} product(s)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Total:</span>
              <span className="text-gray-900 font-bold">₦{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handlePayment}
            disabled={isProcessing}
            className={`w-full text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 
              ${isProcessing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isProcessing ? 'Processing...' : 'Confirm & Pay'}
          </button>
          
          <button 
            onClick={() => navigate('/cart')}
            disabled={isProcessing}
            className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;