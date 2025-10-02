"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Notification {
  id: string;
  userId: string;
  category: string;
  cf: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Errore nel caricamento notifiche:", error);
    }
  };

  const markAsRead = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
      });

      if (response.ok) {
        setUnreadCount(0);
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, isRead: true }))
        );
      }
    } catch (error) {
      console.error("Errore nel marcare notifiche come lette:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBellClick = () => {
    setIsOpen(true);
    if (unreadCount > 0) {
      markAsRead();
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Polling ogni 30 secondi per aggiornare le notifiche
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBellClick}
          className="relative p-2 text-white hover:bg-white/10"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Notifiche
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                Nessuna notifica disponibile
              </p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.isRead
                        ? "bg-gray-50 border-gray-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleString(
                            "it-IT"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="flex justify-center pt-4 border-t">
              <Button
                onClick={markAsRead}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading ? "Aggiornamento..." : "Marca tutte come lette"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
