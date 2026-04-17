import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  ShoppingBag, 
  MessageSquare, 
  Link as LinkIcon,
  ChevronRight,
  Download,
  Instagram,
  Linkedin,
  Facebook,
  Twitter
} from "lucide-react";
import { motion } from "motion/react";
import { format, isAfter, addMinutes } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { Logo } from "./Landing";

interface PublicStockpileData {
  _id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  endDate: string;
  deliveryPaid: boolean;
  status: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    addedAt: string;
  }>;
  totalAmount: number;
  vendorId: {
    businessName: string;
    ownerName: string;
    whatsappNumber: string;
    profilePicture: string;
    currency?: string;
    enableLateFees?: boolean;
    lateFeeAmount?: number;
  };
  lateFee?: number;
  isOverdue?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PublicCustomerView() {
  const { id } = useParams<{ id: string }>();
  const { fetchWithAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PublicStockpileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const response = await fetchWithAuth(`/api/public/stockpiles/${id}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          setError("Stockpile not found or has been removed.");
        }
      } catch (err) {
        setError("Failed to load stockpile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F3]">
        <div className="w-10 h-10 border-4 border-cartlist-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF8F3] p-4 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Oops!</h2>
        <p className="text-muted-foreground mb-8 max-w-xs">{error || "Something went wrong."}</p>
        <Link to="/">
          <Button className="bg-cartlist-orange hover:bg-orange-600 text-white rounded-full px-8 h-12 font-bold">
            Go to Homepage
          </Button>
        </Link>
      </div>
    );
  }

  const daysLeft = Math.ceil((new Date(data.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  // Determine if it's a new or updated stockpile
  // If updatedAt is more than 1 minute after createdAt, it's an update
  const isUpdated = data.updatedAt && isAfter(new Date(data.updatedAt), addMinutes(new Date(data.createdAt), 1));

  return (
    <div className="min-h-screen bg-[#FDF8F3] font-sans relative overflow-hidden flex flex-col">
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          header, footer, .no-print { display: none !important; }
          body { background: white !important; }
          .print-card { 
            box-shadow: none !important; 
            border: 1px solid #eee !important; 
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .wavy-border { display: none !important; }
        }
      `}} />

      {/* Patterned Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none no-print" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 30H15L30 0zM0 30l15 30H-15L0 30zM60 30l15 30H45L60 30z' fill='%23000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />

      {/* Top Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-between relative z-10 no-print">
        <Logo />
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl relative"
        >
          {/* Colorful Wavy Border Container */}
          <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-pink-500 rounded-[42px] opacity-20 blur-sm wavy-border" />
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-pink-600 rounded-[40px] wavy-border" 
               style={{ 
                 clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 2% 2%, 2% 98%, 98% 98%, 98% 2%, 2% 2%)",
                 maskImage: "radial-gradient(circle at center, transparent 0%, black 100%)"
               }} 
          />
          
          <Card className="border-none shadow-2xl bg-white rounded-[36px] overflow-hidden relative print-card">
            <div className="p-8 md:p-12 space-y-8">
              {/* Header with Link Icon */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center no-print">
                  <LinkIcon className="w-6 h-6 text-cartlist-orange" />
                </div>
                <h2 className="text-3xl font-black text-gray-900">Customer View</h2>
              </div>

              {/* Greeting */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                  Hello, {data.customerName.split(' ')[0]} 👋
                </h1>
                <p className="text-muted-foreground font-medium">
                  {isUpdated 
                    ? `${data.vendorId.businessName} has updated your existing stockpile list.`
                    : `${data.vendorId.businessName} has created a stockpile list for you.`
                  }
                </p>
              </div>

              {/* Status Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-sm font-bold text-gray-400">Stockpile status</p>
                  <div className="flex items-center gap-2 bg-[#4ADE80] text-white px-4 py-2 rounded-2xl w-fit font-bold shadow-sm">
                    <Clock className="w-4 h-4" />
                    <span className="capitalize">{data.status}</span>
                  </div>
                </div>
                <div className="space-y-1 md:text-right">
                  <p className="text-sm font-bold text-gray-400">Time remaining</p>
                  <p className={`text-4xl font-black ${daysLeft < 0 ? 'text-red-500' : 'text-gray-900'}`}>
                    {daysLeft > 0 ? `${daysLeft} days` : daysLeft === 0 ? "Closes today" : "Deadline missed"}
                  </p>
                </div>
              </div>

              {/* Late Fee Policy Information */}
              {data.vendorId.enableLateFees && data.vendorId.lateFeeAmount && data.vendorId.lateFeeAmount > 0 && !data.isOverdue && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-orange-50/50 border border-orange-100 rounded-[24px] p-6 space-y-2"
                >
                  <div className="flex items-center gap-2 text-cartlist-orange font-bold text-sm">
                    <Clock className="w-4 h-4" />
                    Late Fee Policy
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Please note that a daily late fee of 
                    <span className="font-bold text-gray-900 mx-1">
                      {data.vendorId.currency === "Dollar" ? "$" : data.vendorId.currency === "Euro" ? "€" : "₦"}
                      {data.vendorId.lateFeeAmount.toLocaleString()}
                    </span>
                    will be applied automatically for every day this stockpile is kept past the deadline of 
                    <span className="font-bold text-gray-900 ml-1">
                      {format(new Date(data.endDate), "do MMM, yyyy")}
                    </span>.
                  </p>
                </motion.div>
              )}

              {/* Late Fees Section (Already Overdue) */}
              {data.isOverdue && data.lateFee && data.lateFee > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-100 rounded-[24px] p-6 space-y-3"
                >
                  <div className="flex items-center gap-3 text-red-600">
                    <Clock className="w-5 h-5" />
                    <h3 className="font-bold">Overdue Stockpile</h3>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 font-medium">Accumulated Late Fee</p>
                    <p className="text-xl font-black text-red-600">
                      {data.vendorId.currency === "Dollar" ? "$" : data.vendorId.currency === "Euro" ? "€" : "₦"}
                      {data.lateFee.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-[10px] text-red-400 font-medium italic">
                    * This fee is calculated daily for stockpiles kept past their deadline.
                  </p>
                </motion.div>
              )}

              {/* Delivery Section */}
              <div className="space-y-3">
                <p className="text-sm font-bold text-gray-400">Delivery fee</p>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className={`flex items-center gap-2 ${data.deliveryPaid ? 'bg-green-500' : 'bg-[#F07E48]'} text-white px-4 py-2 rounded-2xl w-fit font-bold shadow-sm`}>
                    <Package className="w-4 h-4" />
                    <span>{data.deliveryPaid ? "Paid" : "Not paid"}</span>
                  </div>
                  {!data.deliveryPaid && (
                    <button 
                      onClick={() => window.open(`https://wa.me/${data.vendorId.whatsappNumber.replace(/\D/g, '')}`, '_blank')}
                      className="text-cartlist-orange font-bold flex items-center gap-1 hover:underline text-sm no-print"
                    >
                      Contact vendor to pay <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Purchase Info */}
              <div className="pt-4">
                <h3 className="text-xl font-black text-gray-900">
                  Your purchase from {format(new Date(data.createdAt), "do MMMM, yyyy")} at {format(new Date(data.createdAt), "h:mm a")}
                </h3>
              </div>

              {/* Items List */}
              <div className="border-t border-dashed border-gray-200 pt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-black text-gray-900">Items Bought ({data.items.length})</h4>
                  <span className="text-xs text-muted-foreground font-medium">Last updated: {format(new Date(data.updatedAt || data.createdAt), "MMM do, h:mm a")}</span>
                </div>
                <div className="space-y-4">
                  {data.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">
                        {item.name} {item.quantity > 1 ? `(${item.quantity})` : ""}
                      </span>
                      <span className="font-black text-gray-900">N{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-dashed border-gray-200 pt-6 flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total value</span>
                  <span className="text-2xl font-black text-gray-900">
                    {data.vendorId.currency === "Dollar" ? "$" : data.vendorId.currency === "Euro" ? "€" : "₦"}
                    {data.totalAmount.toLocaleString()}
                  </span>
                </div>

                {data.isOverdue && data.lateFee && data.lateFee > 0 && (
                  <div className="pt-4 flex justify-between items-center text-red-600">
                    <span className="font-bold flex items-center gap-1">
                      Grand Total <Clock className="w-3 h-3" />
                    </span>
                    <span className="text-3xl font-black">
                      {data.vendorId.currency === "Dollar" ? "$" : data.vendorId.currency === "Euro" ? "€" : "₦"}
                      {(data.totalAmount + data.lateFee).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Question Section */}
              <div className="border-t border-dashed border-gray-200 pt-8 space-y-6 no-print">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900">Question?</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Have any questions or complaints about your order or stockpile contact us or your vendor
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => window.open(`https://wa.me/${data.vendorId.whatsappNumber.replace(/\D/g, '')}`, '_blank')}
                    className="bg-[#4ADE80] hover:bg-[#3ecf75] text-white rounded-2xl h-14 font-bold gap-2 shadow-lg shadow-green-50"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Chat on WhatsApp
                  </Button>
                  <Button 
                    variant="outline"
                    className="rounded-2xl h-14 font-bold border-gray-200 hover:bg-gray-50 text-gray-600"
                    onClick={() => window.print()}
                  >
                    <Download className="w-5 h-5" />
                    Download receipt
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 no-print">
        <div className="flex items-center gap-4">
          {[Instagram, Linkedin, Facebook, Twitter].map((Icon, i) => (
            <div key={i} className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-cartlist-orange hover:border-cartlist-orange transition-all cursor-pointer">
              <Icon className="w-5 h-5" />
            </div>
          ))}
        </div>
        
        <p className="text-sm font-medium text-gray-400">
          © {new Date().getFullYear()} Cartlist . All rights reserved.
        </p>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cartlist-orange/10 rounded-lg flex items-center justify-center">
            <span className="text-cartlist-orange font-black text-sm">C</span>
          </div>
          <span className="text-lg font-black text-gray-900 tracking-tight">Cartlist</span>
        </div>
      </footer>
    </div>
  );
}
