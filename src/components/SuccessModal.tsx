import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, X, Sparkles, ArrowRight, Copy, ExternalLink, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogAnother?: () => void;
  data?: {
    customerName: string;
    totalAmount: number;
    itemsCount?: number;
    items?: any[];
    endDate: string;
    stockpileId?: string;
    _id?: string;
    isUpdate?: boolean;
  };
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ 
  isOpen, 
  onClose,
  onLogAnother,
  data
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleClose = () => {
    onClose();
    navigate("/dashboard");
  };

  const handleCopyLink = () => {
    if (!data) return;
    const id = data.stockpileId || data._id;
    const link = `${window.location.origin}/view/${id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewStockpile = () => {
    if (!data) return;
    const id = data.stockpileId || data._id;
    onClose();
    navigate(`/stockpile?id=${id}`);
  };

  const handleLogAnother = () => {
    if (onLogAnother) {
      onLogAnother();
    }
  };

  if (!data) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[95vw] sm:max-w-lg bg-white rounded-[24px] sm:rounded-[40px] shadow-2xl overflow-hidden p-5 sm:p-10 text-center my-auto"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleClose}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 rounded-full hover:bg-orange-50 z-10"
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="relative mb-4 sm:mb-6 mt-4 sm:mt-0">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </motion.div>
              
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2"
              >
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-cartlist-orange fill-cartlist-orange opacity-40" />
              </motion.div>
            </div>

            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-black mb-2 text-gray-900 px-2"
            >
              {data.isUpdate 
                ? `${data.customerName.split(' ')[0]}'s stockpile updated!` 
                : `${data.customerName.split(' ')[0]}'s purchase logged!`}
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed px-2"
            >
              {data.isUpdate 
                ? `${data.customerName}'s stockpile list has been successfully updated.` 
                : `${data.customerName}'s purchase has been successfully recorded.`}
            </motion.p>

            {/* Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[#FDF8F3] border border-orange-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-6 sm:mb-8 text-left space-y-3 sm:space-y-4"
            >
              <div className="flex justify-between items-center border-b border-orange-100/50 pb-2 sm:pb-3">
                <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</span>
                <span className="text-sm sm:text-base font-bold text-gray-900 truncate ml-2">{data.customerName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-orange-100/50 pb-2 sm:pb-3">
                <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Total</span>
                <span className="font-black text-lg sm:text-xl text-cartlist-orange">₦{data.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-orange-100/50 pb-2 sm:pb-3">
                <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Items</span>
                <span className="text-sm sm:text-base font-bold text-gray-900">{data.itemsCount || data.items?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Ends</span>
                <span className="text-sm sm:text-base font-bold text-gray-900">{new Date(data.endDate).toLocaleDateString()}</span>
              </div>
            </motion.div>

            {/* Link Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-6 sm:mb-8"
            >
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-left">Customer View Link</p>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 truncate text-left">
                  {`${window.location.origin}/view/${data.stockpileId || data._id}`}
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleCopyLink}
                  className={`shrink-0 rounded-xl border-gray-200 transition-all ${copied ? "bg-green-50 text-green-600 border-green-200" : ""}`}
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-2 sm:space-y-3"
            >
              <Button 
                onClick={handleViewStockpile}
                className="w-full h-12 sm:h-14 bg-cartlist-orange hover:bg-orange-600 text-white rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold shadow-lg group"
              >
                View Stockpile
                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <Button 
                  variant="outline"
                  onClick={handleLogAnother}
                  className="h-12 sm:h-14 border-orange-100 text-cartlist-orange hover:bg-orange-50 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base"
                >
                  Log Another
                </Button>
                <Button 
                  variant="ghost"
                  onClick={handleClose}
                  className="h-12 sm:h-14 text-gray-500 hover:bg-gray-50 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base"
                >
                  Dashboard
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
