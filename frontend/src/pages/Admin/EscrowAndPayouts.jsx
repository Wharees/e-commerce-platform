import React, { useState, useEffect } from 'react';

const EscrowAndPayouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch pending payouts when the page loads
  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        // Adjust the port/URL to match your backend
        const response = await fetch('http://localhost:5000/api/admin/payouts/pending', {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${localStorage.getItem('lasu_token')}` // Uncomment if your route is protected
          }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setPayouts(data);
        } else {
          console.error("Failed to fetch payouts:", data.message);
        }
      } catch (error) {
        console.error("Network error fetching payouts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayouts();
  }, []);

  const handleApprove = async (payoutId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/payouts/${payoutId}/approve`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('lasu_token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Remove the approved payout from the screen
        setPayouts(payouts.filter(p => p._id !== payoutId));
        alert("Payout approved successfully!");
      } else {
        alert(data.message || "Failed to approve payout");
      }
    } catch (error) {
      console.error("Error approving payout:", error);
      alert("Network error, check if your Node.js backend is running!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-white">
            Escrow & Payouts
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Review and manage vendor withdrawal requests.
          </p>
        </div>
        
        <div className="bg-slate-800 shadow sm:rounded-lg border border-slate-700 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 font-medium">
              Loading pending payouts...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Vendor Name
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Amount (₦)
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Request Date
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                  {payouts.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                        No pending payouts at this time.
                      </td>
                    </tr>
                  ) : (
                    payouts.map((payout) => (
                      <tr key={payout._id} className="hover:bg-slate-700/50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {payout.vendorName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-lasu-green">
                          ₦{payout.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {new Date(payout.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          <button 
                            onClick={() => handleApprove(payout._id)}
                            className="inline-flex justify-center items-center py-1.5 px-4 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-lasu-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-lasu-green mr-3 transition"
                          >
                            Approve
                          </button>
                          <button 
                            className="inline-flex justify-center items-center py-1.5 px-4 border border-slate-600 rounded-md shadow-sm text-xs font-medium text-slate-300 bg-transparent hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500 transition"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default EscrowAndPayouts;