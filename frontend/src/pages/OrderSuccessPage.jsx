import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '../store/store';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCartStore();

  // We will grab the order details passed from the checkout page
  // If they somehow land here directly, we use fallback data
  const orderDetails = location.state || {
    reference: `LASU-${Date.now().toString().slice(-6)}`,
    itemsCount: 0,
    total: 0
  };

  // Automatically clear the cart as soon as this page loads!
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 flex justify-center items-start">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mt-10 text-center">
        
        {/* Big Green Checkmark */}
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed! 🎉</h2>
        <p className="text-gray-500 text-sm mb-8">Your payment was successful. Thank you!</p>

        {/* Order Summary Box */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 mb-8 text-left">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-gray-600 font-medium">Reference:</span>
              <span className="text-gray-900 font-mono text-xs mt-0.5">{orderDetails.reference}</span>
            </div>
            
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-gray-600 font-medium">Platform:</span>
              <span className="text-gray-900">LASU Commerce</span>
            </div>

            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-gray-600 font-medium">Items:</span>
              <span className="text-gray-900">{orderDetails.itemsCount}</span>
            </div>

            <div className="flex justify-between pt-1">
              <span className="text-gray-600 font-medium">Total Paid:</span>
              <span className="text-gray-900 font-bold">₦{orderDetails.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/orders')}
            className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            View Orders
          </button>
          
          <button 
            onClick={() => navigate('/marketplace')}
            className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition"
          >
            Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccessPage;