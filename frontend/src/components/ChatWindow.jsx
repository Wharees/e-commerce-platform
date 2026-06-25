import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { useAuthStore } from '../store/store';

const ChatWindow = ({ otherUserId }) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const fetchConversation = async () => {
    if (!otherUserId) return;
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/messages/conversation/${otherUserId}`);
      setMessages(response.data.messages || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  useEffect(() => {
    fetchConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherUserId]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setError('');

    try {
      const response = await api.post('/messages/send', {
        receiverId: otherUserId,
        content: newMessage.trim()
      });

      setMessages(prev => [...prev, response.data.data]);
      setNewMessage('');
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send message');
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-semibold">Access Denied</h2>
        <p className="text-gray-600">Please login to use the chat.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="bg-lasu-green-600 text-white px-4 py-3 font-semibold">Chat with Vendor</div>
        <div className="h-96 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
            <div className="text-center text-gray-500">Loading conversation...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500">No messages yet. Send the first message.</div>
          ) : (
            messages.map(msg => {
              const isSent = msg.sender?._id === user._id || msg.sender === user._id;
              return (
                <div key={msg._id} className={`mb-4 flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isSent ? 'bg-lasu-green-600 text-white' : 'bg-white text-gray-900 shadow-sm'}`}>
                    <div className="text-sm text-gray-500 mb-1">{isSent ? 'You' : msg.sender?.fullName || 'Vendor'}</div>
                    <div>{msg.content}</div>
                    <div className="text-xs text-gray-400 mt-2 text-right">{new Date(msg.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              );
            }))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 bg-white border-t border-gray-200">
          {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
          <div className="flex gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 rounded-xl border border-gray-300 p-3 focus:border-lasu-green-500 focus:ring-lasu-green-500"
              rows={2}
              placeholder="Type your message here..."
            />
            <button
              type="button"
              onClick={handleSend}
              className="rounded-xl bg-lasu-green-600 px-5 py-3 text-white hover:bg-lasu-green-700"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
