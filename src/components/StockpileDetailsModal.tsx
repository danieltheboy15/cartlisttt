import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle2, Clock, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Calendar } from "./ui/calendar";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { ConfirmationModal } from "./ConfirmationModal";

interface StockpileItem {
  name: string;
  price: number;
  quantity: number;
  addedAt: string;
}

interface Stockpile {
  _id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  endDate: string;
  deliveryPaid: boolean;
  status: "active" | "closed";
  items: StockpileItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export const StockpileDetailsModal = ({ stockpile, isOpen, onClose, onUpdate }: { stockpile: Stockpile | null, isOpen: boolean, onClose: () => void, onUpdate?: () => void }) => {
  const navigate = useNavigate();
  const { user, fetchWithAuth } = useAuth();
  const { showToast } = useToast();
  const [isExtending, setIsExtending] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  if (!stockpile) return null;

  // Calculate late fee if enabled
  let lateFee = 0;
  if (user?.enableLateFees && user?.lateFeeAmount && user.lateFeeAmount > 0 && stockpile.status === "active") {
    const deadline = new Date(stockpile.endDate);
    const now = new Date();
    if (now > deadline) {
      const diffTime = Math.abs(now.getTime() - deadline.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      lateFee = diffDays * user.lateFeeAmount;
    }
  }

  const totalItems = stockpile.items.reduce((acc, item) => acc + item.quantity, 0);
  const startDate = new Date(stockpile.createdAt);
  const endDate = new Date(stockpile.endDate);
  const now = new Date();
  
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  const diffHours = Math.max(0, Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

  const handleApplyExtension = async () => {
    if (!selectedDate) return;
    
    setIsSaving(true);
    try {
      const response = await fetchWithAuth(`/api/stockpiles/${stockpile._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endDate: selectedDate.toISOString() })
      });
      
      if (response.ok) {
        if (onUpdate) onUpdate();
        setIsExtending(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error extending stockpile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseStockpile = async () => {
    setIsSaving(true);
    try {
      const response = await fetchWithAuth(`/api/stockpiles/${stockpile._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" })
      });
      
      if (response.ok) {
        if (onUpdate) onUpdate();
        setIsConfirmOpen(false);
        onClose();
      }
    } catch (error) {
      console.error("Error closing stockpile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setIsExtending(false);
    setSelectedDate(undefined);
    onClose();
  };

  const handleSendReminder = async () => {
    if (!stockpile) return;
    setIsSendingReminder(true);
    try {
      const response = await fetchWithAuth(`/api/stockpiles/${stockpile._id}/remind`, {
        method: "POST"
      });
      if (response.ok) {
        showToast("Reminder sent");
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
    } finally {
      setIsSendingReminder(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1E1E2D] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto"
            >
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <p className="font-bold">Stockpile end date has been updated successfully</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-gray-50">
              <h3 className="text-xl font-bold text-gray-900">{stockpile.customerName}</h3>
              <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full hover:bg-gray-100">
                <X className="w-6 h-6 text-gray-400" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 sm:space-y-8">
              {/* Profile Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
                    <img src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${stockpile.customerName}`} alt="Avatar" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-1">{stockpile.customerName}</h4>
                    <div className={`flex items-center gap-2 px-2 py-0.5 rounded-full w-fit ${
                      stockpile.status === "active" ? "bg-green-50 text-green-600" : "bg-orange-50 text-cartlist-orange"
                    }`}>
                      {stockpile.status === "active" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span className="text-[10px] font-bold uppercase">
                        {stockpile.status === "active" ? "Active stockpile" : "Closed stockpile"}
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate(`/customers/${stockpile.customerPhone}`)}
                  className="bg-[#1E1E2D] hover:bg-[#2D2D3F] text-white rounded-full px-6 h-11 font-bold text-sm w-full sm:w-auto"
                >
                  View customer
                </Button>
              </div>

              {/* Days remaining */}
              <div className="p-6 rounded-[24px] border border-gray-100 bg-white space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="font-bold text-gray-900">Days remaining in stock</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="bg-gray-50 text-gray-400 text-xs font-bold rounded-lg h-8 px-3"
                    onClick={handleSendReminder}
                    disabled={isSendingReminder || stockpile.status === "closed"}
                  >
                    {isSendingReminder ? "Sending..." : "Send reminder"}
                  </Button>
                </div>

                <div className="space-y-4">
                  <p className="text-lg font-bold text-gray-900">
                    {diffTime > 0 ? (
                      <>
                        <span className="text-2xl">{diffDays}</span> Days <span className="text-2xl">{diffHours}</span> hours in total ⌛
                      </>
                    ) : (
                      <span className="text-red-500 font-black">Stockpile Deadline Missed! ⚠️</span>
                    )}
                  </p>
                  <div className="flex gap-1 h-2">
                    {[1, 2, 3, 4].map((seg) => {
                      const total = endDate.getTime() - startDate.getTime();
                      const elapsed = now.getTime() - startDate.getTime();
                      const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
                      const isActive = progress >= (seg * 25);
                      return (
                        <div 
                          key={seg} 
                          className={`flex-1 rounded-full transition-colors ${
                            isActive ? (diffTime > 0 ? "bg-cartlist-orange" : "bg-red-400") : "bg-gray-200"
                          }`} 
                        />
                      );
                    })}
                  </div>
                </div>

                {lateFee > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 text-red-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-bold uppercase tracking-wider">Late fee accumulated</span>
                    </div>
                    <span className="font-black text-red-600">
                      {user?.currency === "Naira" ? "₦" : user?.currency === "Dollar" ? "$" : "€"}
                      {lateFee.toLocaleString()}
                    </span>
                  </motion.div>
                )}
              </div>

              {isExtending ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 bg-gray-50/50 p-6 rounded-[24px] border border-orange-50"
                >
                  <div className="flex items-center justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate || endDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-xl border-none bg-transparent"
                      classNames={{
                        day_selected: "bg-cartlist-orange text-white hover:bg-orange-600 focus:bg-orange-600",
                        day_today: "bg-orange-50 text-cartlist-orange",
                      }}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => setIsExtending(false)}
                      className="flex-1 h-12 rounded-xl border-gray-200 font-bold"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleApplyExtension}
                      disabled={!selectedDate || isSaving}
                      className="flex-1 h-12 rounded-xl bg-cartlist-orange hover:bg-orange-600 text-white font-bold"
                    >
                      {isSaving ? "Applying..." : "Apply"}
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* Items Bought */}
                  <div className="space-y-4">
                    <h5 className="font-bold text-gray-900">Items Bought ({totalItems})</h5>
                    <div className="space-y-3">
                      {stockpile.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 font-medium">{item.name} {item.quantity > 1 ? `(${item.quantity})` : ''}</span>
                          <span className="font-bold text-gray-900">₦{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-100">
                        <span className="text-gray-500 font-medium">Total amount</span>
                        <span className="font-bold text-gray-900">₦{stockpile.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Delivery fee</span>
                        <span className="font-bold text-gray-900">{stockpile.deliveryPaid ? "Paid" : "Not Paid"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div className="space-y-4">
                    <h5 className="font-bold text-gray-900">Date and time</h5>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 font-medium">Date</span>
                        <span className="font-bold text-gray-900 uppercase">
                          {startDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 font-medium">Time</span>
                        <span className="font-bold text-gray-900">
                          {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {!isExtending && (
              <div className="p-6 sm:p-8 pt-0 flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsExtending(true)}
                  disabled={stockpile.status === "closed"}
                  className="flex-1 h-14 rounded-2xl border-cartlist-orange text-cartlist-orange font-bold hover:bg-orange-50 gap-2 order-1 sm:order-none shadow-sm shadow-orange-100 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
                >
                  <Clock className="w-5 h-5" />
                  Extend time
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-14 rounded-2xl border-gray-200 text-gray-400 font-bold hover:bg-gray-50 gap-2 order-2 sm:order-none active:scale-[0.98] transition-transform"
                  onClick={() => setIsConfirmOpen(true)}
                  disabled={isSaving || stockpile.status === "closed"}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {stockpile.status === "closed" ? "Stockpile closed" : "Close stockpile"}
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    <ConfirmationModal
      isOpen={isConfirmOpen}
      onClose={() => setIsConfirmOpen(false)}
      onConfirm={handleCloseStockpile}
      title="Close Stockpile"
      message="Are you sure you want to close this stockpile? This will mark it as completed."
      confirmText="Yes, Close"
      variant="warning"
      isLoading={isSaving}
    />
    </>
  );
};
