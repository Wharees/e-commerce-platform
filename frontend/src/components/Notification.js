import React from 'react';
import { useNotificationStore } from '../store/store';
import { HiX } from 'react-icons/hi';

const Notification = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-20 right-4 space-y-2 z-50">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg text-white max-w-sm animate-slide-in ${
            notification.type === 'success'
              ? 'bg-green-500'
              : notification.type === 'error'
              ? 'bg-red-500'
              : notification.type === 'warning'
              ? 'bg-yellow-500'
              : 'bg-blue-500'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold">{notification.title}</p>
              <p className="text-sm">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4"
            >
              <HiX />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notification;
