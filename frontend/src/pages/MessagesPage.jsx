import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuthStore } from '../store/store';

const MessagesPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatWithId = searchParams.get('chatWith');

  const [inbox, setInbox] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const messagesEndRef = useRef(null);

  // --- NEW: Attachment States ---
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const response = await api.get('/messages/conversations');
        setInbox(Array.isArray(response.data.conversations) ? response.data.conversations : []);
      } catch (error) {
        console.error("Error fetching inbox:", error);
      }
    };
    if (user) fetchInbox();
  }, [user]);

  useEffect(() => {
    if (!chatWithId || chatWithId === 'null') return;
    
    const fetchMessages = async () => {
      setLoadingChat(true);
      try {
        const response = await api.get(`/messages/conversation/${chatWithId}`);
        const fetchedMessages = response.data.messages || response.data;
        setMessages(Array.isArray(fetchedMessages) ? fetchedMessages : []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoadingChat(false);
      }
    };
    fetchMessages();
  }, [chatWithId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    // Stop if everything is empty
    if ((!newMessage.trim() && !selectedFile) || !chatWithId || chatWithId === 'null') return;

    try {
      let uploadedImagePath = null;

      // --- NEW: If there is a file, upload it FIRST ---
      if (selectedFile) {
        const formData = new FormData();
        // Make sure 'image' matches what your backend multer expects!
        formData.append('image', selectedFile); 
        
       // 👇 CHANGED THIS LINE 👇
        const uploadRes = await api.post('/messages/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Grab the file path from your backend response
        uploadedImagePath = uploadRes.data.url || uploadRes.data.path || uploadRes.data;
      }

      // Send the text AND the image path to the database
      const response = await api.post('/messages/send', {
        receiverId: chatWithId,
        content: newMessage,
        attachments: uploadedImagePath ? [uploadedImagePath] : []
      });
      
      const sentMsg = response.data.data;
      sentMsg.sender = user; 
      
      setMessages((prev) => [...prev, sentMsg]);
      setNewMessage('');
      setSelectedFile(null); // Clear the preview
      
    } catch (error) {
      console.error("Backend Error:", error);
      alert("Could not send message. Please try again.");
    }
  };

  const getOtherUser = (message) => {
    if (!message || !user) return null;
    const senderId = typeof message.sender === 'object' ? (message.sender?._id || message.sender?.id) : message.sender;
    const myId = user?._id || user?.id;
    return String(senderId) === String(myId) ? message.receiver : message.sender;
  };

  let activeChatName = "Customer / Vendor";
  if (messages.length > 0 && messages[0]) {
    const otherUser = getOtherUser(messages[0]);
    activeChatName = otherUser?.fullName || otherUser?.name || "Customer / Vendor";
  }

  const avatarLetter = activeChatName ? activeChatName.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Messages</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex h-[75vh]">
          
          <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50 font-semibold text-gray-700">
              Recent Conversations
            </div>
            <div className="flex-1 overflow-y-auto">
              {inbox.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">No conversations yet.</div>
              ) : (
                inbox.map((chat) => {
                  const otherUser = getOtherUser(chat.lastMessage);
                  const otherUserId = typeof otherUser === 'object' ? (otherUser?._id || otherUser?.id) : otherUser;
                  const isSelected = chatWithId === String(otherUserId);
                  const displayName = otherUser?.fullName || otherUser?.name || 'Customer / Vendor';

                  return (
                    <div 
                      key={chat.conversationId || Math.random()}
                      onClick={() => navigate(`/messages?chatWith=${otherUserId}`)}
                      className={`p-4 border-b border-gray-100 cursor-pointer transition ${
                        isSelected ? 'bg-green-50 border-l-4 border-l-lasu-green' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-semibold text-gray-800 truncate">{displayName}</div>
                      <div className="text-sm text-gray-500 truncate mt-1">
                        {chat.lastMessage?.attachments?.length > 0 ? '📎 Image' : chat.lastMessage?.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="w-2/3 flex flex-col bg-slate-50 relative">
            {!chatWithId || chatWithId === 'null' ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Select a conversation from the left to start chatting.
              </div>
            ) : (
              <>
                <div className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-10 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-lasu-green text-white flex items-center justify-center font-bold text-lg">
                    {avatarLetter}
                  </div>
                  <h2 className="font-bold text-lg text-gray-800">{activeChatName}</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {loadingChat ? (
                    <div className="text-center text-gray-400 mt-10">Loading conversation...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">Say hello!</div>
                  ) : (
                    messages.map((msg, index) => {
                      const msgSenderId = typeof msg.sender === 'object' ? (msg.sender?._id || msg.sender?.id) : msg.sender;
                      const myId = user?._id || user?.id;
                      const isMe = String(msgSenderId) === String(myId);
                      
                      return (
                        <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] rounded-2xl px-5 py-3 flex flex-col gap-2 ${
                              isMe ? 'bg-lasu-green text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                            }`}>
                            
                          {msg.attachments && msg.attachments.length > 0 && msg.attachments[0] && (
                            <img 
                              // encodeURI makes spaces and parentheses web-safe!
                              src={`http://localhost:5000/${encodeURI(msg.attachments[0].replace(/\\/g, '/').replace(/^\/+/, ''))}`}
                              alt="attachment" 
                              className="rounded-lg max-h-64 w-full object-cover shadow-sm border border-gray-200"
                            />
                          )}
                            
                            {msg.content && <p>{msg.content}</p>}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* --- NEW: Image Preview Box --- */}
                {selectedFile && (
                  <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-3">
                    <div className="relative inline-block">
                      <img 
                        src={URL.createObjectURL(selectedFile)} 
                        alt="preview" 
                        className="h-16 w-16 object-cover rounded-lg border border-gray-300"
                      />
                      <button 
                        onClick={() => setSelectedFile(null)} 
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow-sm"
                      >
                        ✕
                      </button>
                    </div>
                    <span className="text-sm text-gray-500 truncate max-w-[200px]">{selectedFile.name}</span>
                  </div>
                )}

                <div className="p-4 bg-white border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                    
                    {/* --- NEW: Hidden file input and visible Paperclip Button --- */}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current.click()}
                      className="p-3 text-gray-400 hover:text-lasu-green transition rounded-full hover:bg-gray-50"
                      title="Attach Image"
                    >
                      📎
                    </button>

                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="flex-1 rounded-full border border-gray-300 px-6 py-3 focus:outline-none focus:border-lasu-green focus:ring-1 focus:ring-lasu-green"
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim() && !selectedFile}
                      className="bg-lasu-green text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition disabled:opacity-50"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;