import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useCartStore } from '../store/store'; 

const CartPage = () => {
  const navigate = useNavigate();
  const { items, total, removeFromCart, updateQuantity, fetchCart } = useCartStore();

  useEffect(() => {
    if (fetchCart) {
      fetchCart();
    }
  }, [fetchCart]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      {!items || items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <a href="/marketplace" className="btn-primary">Continue Shopping</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {items.map(item => {
              // 👻 GHOSTBUSTER FIX: Accurately grabs the ID whether it is an Object, a String from DB, or Local State!
              const actualProductId = item.product?._id || (typeof item.product === 'string' ? item.product : item._id);
              
              return (
                <div key={actualProductId} className="bg-white p-4 rounded-lg mb-4 flex justify-between items-center shadow-sm border border-gray-100">
                  <div>
                    <h3 className="font-bold text-gray-800">{item.name || item.product?.name || "Marketplace Item"}</h3>
                    <p className="text-gray-600">₦{item.price || item.product?.price}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button onClick={() => updateQuantity(actualProductId, item.quantity - 1)} className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 font-bold">-</button>
                    <span className="font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(actualProductId, item.quantity + 1)} className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 font-bold">+</button>
                    
                    <button onClick={() => removeFromCart(actualProductId)} className="text-red-600 hover:text-red-800 font-medium ml-4">Remove</button>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="bg-white p-6 rounded-lg h-fit shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Order Summary</h3>
            <div className="flex justify-between mb-4 text-gray-600">
              <span>Subtotal:</span>
              <span>₦{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-4 text-gray-600">
              <span>Shipping:</span>
              <span>₦0</span>
            </div>
            <div className="flex justify-between font-bold text-lg mb-6 text-gray-900 border-t pt-4">
              <span>Total:</span>
              <span>₦{total.toLocaleString()}</span>
            </div>
            <button 
              onClick={() => navigate('/checkout')} 
              className="btn-primary w-full bg-lasu-green text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;