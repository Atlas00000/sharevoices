import React, { useState } from 'react';
import { FaBell, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const notifications = [
  {
    id: 1,
    icon: <FaCheckCircle className="text-green-500" />,
    message: 'Your article was published!',
    time: '2h ago',
  },
  {
    id: 2,
    icon: <FaExclamationCircle className="text-yellow-500" />,
    message: 'Profile incomplete. Add your bio.',
    time: '1d ago',
  },
];

export default function NotificationsWidget() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative animate-fade-in">
      <button
        className="relative p-2 rounded-full bg-blue-50 hover:bg-blue-100 transition group focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="Show notifications"
      >
        <FaBell className={`text-blue-600 text-xl group-hover:animate-bounce ${open ? 'animate-bounce' : ''}`} />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{notifications.length}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg p-4 z-50 animate-fade-in">
          <h5 className="font-semibold mb-2">Notifications</h5>
          {notifications.length === 0 ? (
            <div className="text-gray-400 text-sm">No notifications</div>
          ) : (
            <ul className="flex flex-col gap-3">
              {notifications.map((n) => (
                <li key={n.id} className="flex items-center gap-3 p-2 rounded hover:bg-blue-50 transition group">
                  {n.icon}
                  <span className="flex-1 text-sm">{n.message}</span>
                  <span className="text-xs text-gray-400">{n.time}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
} 