import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Bell, CheckCircle2, AlertCircle, Info, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "../contexts/NotificationContext";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[400px] bg-white z-[201] shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-orange-50 flex items-center justify-between bg-orange-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cartlist-orange/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-cartlist-orange" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      {unreadCount} Unread
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[10px] font-bold text-cartlist-orange hover:bg-orange-100 h-8 px-3 rounded-full"
                      onClick={() => markAllAsRead()}
                    >
                      Mark all as read
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100">
                    <X className="w-5 h-5 text-gray-400" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-orange-50">
                    {notifications.map((n) => (
                      <motion.div 
                        key={n._id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-6 hover:bg-orange-50/30 transition-colors cursor-pointer relative ${!n.isRead ? 'bg-orange-50/10' : ''}`}
                        onClick={() => markAsRead(n._id)}
                      >
                        {!n.isRead && (
                          <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-cartlist-orange" />
                        )}
                        <div className="flex gap-4">
                          <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${
                            n.type === 'urgent' ? 'bg-red-50 text-red-500' : 
                            n.type === 'success' ? 'bg-green-50 text-green-500' :
                            n.type === 'warning' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'
                          }`}>
                            {n.type === 'urgent' ? <AlertCircle className="w-5 h-5" /> : 
                             n.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                             n.type === 'warning' ? <Info className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                          </div>
                          <div className="space-y-1 flex-1">
                            <p className={`text-sm ${!n.isRead ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                            <div className="flex items-center justify-between pt-2">
                              <p className="text-[10px] text-gray-400 font-medium">
                                {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Bell className="w-10 h-10 text-gray-200" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">All caught up!</h4>
                    <p className="text-sm text-muted-foreground">No new notifications for you right now.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-orange-50 bg-gray-50/50">
                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-2xl border-orange-100 text-gray-500 hover:bg-orange-100 font-bold"
                  onClick={onClose}
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
