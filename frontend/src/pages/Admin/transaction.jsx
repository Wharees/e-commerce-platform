import React, { useState, useEffect } from 'react';

const Transactions = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayouts = async () => {
      const token = localStorage.getItem('lasu_token');
      try {
        const response = await fetch('http://localhost:5000/api/admin/payouts/pending', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        setPayouts(data.payouts || []);
      } catch (err) {
        console.error("Error fetching payouts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayouts();
  }, []);

  return (
    <div className="p-6 bg-slate-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Escrow & Payouts</h1>
      <div className="bg-slate-800 p-4 rounded-lg">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="p-4">VENDOR NAME</th>
              <th className="p-4">AMOUNT (₦)</th>
              <th className="p-4">REQUEST DATE</th>
              <th className="p-4">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="text-center p-4">Loading...</td></tr>
            ) : payouts.length === 0 ? (
              <tr><td colSpan="4" className="text-center p-4">No pending payouts at this time.</td></tr>
            ) : (
              payouts.map((payout) => (
                <tr key={payout._id} className="border-b border-slate-700">
                  <td className="p-4">{payout.vendor?.fullName || 'Unknown'}</td>
                  <td className="p-4">₦{payout.amount?.toLocaleString()}</td>
                  <td className="p-4">{new Date(payout.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition">
                      Approve
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;