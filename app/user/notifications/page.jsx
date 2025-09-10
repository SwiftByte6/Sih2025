"use client";

import { useState } from "react";
import { AlertCircle, X } from "lucide-react";

export default function Page() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "High Temperature",
      message: "Server room temperature has exceeded safe levels. Immediate cooling required.",
    },
    {
      id: 2,
      title: "Unauthorized Access",
      message: "Multiple failed login attempts detected from unknown IP addresses.",
    },
    {
      id: 3,
      title: "System Overload",
      message: "CPU usage has reached 95%. Consider shutting down non-essential processes.",
    },
  ]);

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-lg space-y-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="flex items-start gap-4 rounded-2xl border border-red-300 bg-red-50 p-6 sm:p-4 shadow-lg"
          >
            {/* Icon */}
            <AlertCircle className="h-8 w-8 text-red-600 mt-1 sm:h-6 sm:w-6" />

            {/* Message */}
            <div className="flex-1">
              <h2 className="text-lg sm:text-base text-red-800 font-bold">
                {n.title}
              </h2>
              <p className="text-base sm:text-sm text-red-700 leading-relaxed">
                {n.message}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={() => dismissNotification(n.id)}
              className="rounded-lg p-2 hover:bg-red-100 transition"
            >
              <X className="h-6 w-6 text-red-600 sm:h-5 sm:w-5" />
            </button>
          </div>
        ))}

        {notifications.length === 0 && (
          <p className="text-center text-gray-600 text-sm">
            🎉 No hazard notifications!
          </p>
        )}
      </div>
    </main>
  );
}
