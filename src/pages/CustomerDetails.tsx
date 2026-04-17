import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Plus, 
  MessageSquare, 
  Link as LinkIcon, 
  Trash2, 
  Copy,
  CheckCircle2,
  Clock,
  CircleDollarSign,
  Package,
  ChevronRight,
  MoreHorizontal,
  Search,
  Edit2,
  LayoutGrid,
  ShoppingBag,
  Users,
  Settings as SettingsIcon,
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  X,
  FileText,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { LogPurchaseDrawer } from "@/components/LogPurchaseDrawer";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { RemoveCustomerModal } from "@/components/RemoveCustomerModal";
import { Logo } from "./Landing";

interface CustomerDetailsData {
  customer: {
    name: string;
    phone: string;
    email: string;
    note: string;
    hasActiveStockpile: boolean;
    deliveryPaid: boolean;
  };
  stats: {
    totalAmountPurchased: number;
    totalNotPaid: number;
    avgTimeSpent: number;
    avgItemPrice: number;
  };
  history: Array<{
    _id: string;
    name: string;
    quantity: number;
    price: number;
    date: string;
    status: string;
    isDelivered: boolean;
  }>;
}

export default function CustomerDetails() {
  const { phone } = useParams<{ phone: string }>();
  const navigate = useNavigate();
  const { user, logout, fetchWithAuth } = useAuth();
  const { showToast } = useToast();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CustomerDetailsData | null>(null);
  const [note, setNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNoteSuccess, setShowNoteSuccess] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  useEffect(() => {
    fetchCustomerDetails();
  }, [phone]);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`/api/customers/${phone}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
        setNote(result.customer.note);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    setIsSavingNote(true);
    try {
      const response = await fetchWithAuth(`/api/customers/${phone}/note`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note })
      });
      if (response.ok) {
        setShowNoteSuccess(true);
        setTimeout(() => setShowNoteSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleRemoveClick = () => {
    const skipConfirmation = localStorage.getItem("skip_delete_confirmation") === "true";
    if (skipConfirmation) {
      handleRemoveClient();
    } else {
      setIsRemoveModalOpen(true);
    }
  };

  const handleRemoveClient = async () => {
    try {
      const response = await fetchWithAuth(`/api/customers/${phone}`, {
        method: "DELETE"
      });
      if (response.ok) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error removing client:", error);
    }
  };

  const handleConfirmRemove = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem("skip_delete_confirmation", "true");
    }
    handleRemoveClient();
    setIsRemoveModalOpen(false);
  };

  const handleToggleDelivery = async (stockpileId: string) => {
    try {
      const response = await fetchWithAuth(`/api/stockpiles/${stockpileId}/toggle-delivery`, {
        method: "PATCH"
      });
      if (response.ok) {
        fetchCustomerDetails();
      }
    } catch (error) {
      console.error("Error toggling delivery:", error);
    }
  };

  const copyToClipboard = () => {
    if (!data) return;
    
    // Find the active stockpile ID from history or the most recent one
    const activeStockpile = data.history.find(h => h.status === "Pending" || !h.isDelivered);
    const stockpileId = activeStockpile?._id || (data.history.length > 0 ? data.history[0]._id : null);
    
    if (stockpileId) {
      const publicLink = `${window.location.origin}/view/${stockpileId}`;
      navigator.clipboard.writeText(publicLink);
      showToast("Copied to clipboard");
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dashboard-bg">
        <div className="w-10 h-10 border-4 border-cartlist-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen dashboard-bg font-sans">
      {/* Top Navigation */}
      <header className="bg-white border-b border-orange-50 px-4 md:px-8 h-20 flex items-center sticky top-0 z-50">
        <div className="flex-1 flex items-center lg:hidden">
          <Button variant="ghost" size="icon" className="w-10 h-10" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex-shrink-0 flex items-center justify-center">
          <Logo className="lg:static scale-90 md:scale-100" />
        </div>
        
        <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          <Link to="/dashboard">
            <Button variant="ghost" className="text-gray-400 font-medium hover:text-cartlist-orange px-4">
              Dashboard
            </Button>
          </Link>
          <Link to="/stockpile">
            <Button variant="ghost" className="text-gray-400 font-medium hover:text-cartlist-orange px-4">
              Stockpile
            </Button>
          </Link>
          <Link to="/customers">
            <Button variant="ghost" className="bg-[#FFF5ED] text-cartlist-orange font-bold rounded-2xl px-6 py-6 flex items-center gap-2">
              <Users className="w-5 h-5 fill-cartlist-orange" />
              Customers
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" className="text-gray-400 font-medium hover:text-cartlist-orange px-4">Settings</Button>
          </Link>
        </nav>

        <div className="flex-1 flex items-center justify-end gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative cursor-pointer">
                  <Button variant="ghost" size="icon" className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-200 hover:bg-orange-50">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                  </Button>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 md:w-5 md:h-5 bg-[#E13D3D] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-2xl p-0 shadow-2xl border border-orange-100 bg-white z-[200] overflow-hidden">
                <div className="p-4 border-b border-orange-50 flex items-center justify-between bg-orange-50/30">
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[10px] font-bold text-cartlist-orange hover:bg-orange-100 h-7 px-2"
                      onClick={() => markAllAsRead()}
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-orange-50">
                      {notifications.map((n) => (
                        <div 
                          key={n._id} 
                          className={`p-4 hover:bg-orange-50/30 transition-colors cursor-pointer ${!n.isRead ? 'bg-orange-50/10' : ''}`}
                          onClick={() => markAsRead(n._id)}
                        >
                          <div className="flex gap-3">
                            <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                              n.type === 'urgent' ? 'bg-red-500' : 
                              n.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                            }`} />
                            <div className="space-y-1">
                              <p className={`text-sm ${!n.isRead ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                              <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                              <p className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-sm text-muted-foreground">No notifications yet</p>
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 md:gap-3 p-1 lg:pl-2 lg:pr-4 h-12 md:h-14 rounded-full hover:bg-orange-50 transition-all focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                  <img src={user?.profilePicture || "https://raw.githubusercontent.com/DannyYo696/svillage/29b4c24e6ca88b3ecf3856f30fceb3f29eef40bf/profile%20picture.webp"} alt="Avatar" />
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-bold leading-none mb-1">{user?.ownerName || "John Doe"}</p>
                  <p className="text-[10px] text-muted-foreground">{user?.email || "johndoe@cartlist.com"}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden lg:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-orange-100 shadow-xl">
              <DropdownMenuItem 
                onClick={() => navigate("/settings")}
                className="rounded-xl px-3 py-2 cursor-pointer flex items-center gap-3 focus:bg-orange-50 focus:text-cartlist-orange outline-none"
              >
                <SettingsIcon className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-orange-50" />
              <DropdownMenuItem onClick={handleLogout} className="rounded-xl px-3 py-2 cursor-pointer flex items-center gap-3 text-red-500 focus:bg-red-50 focus:text-red-600">
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[101] lg:hidden p-6 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <Logo />
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <nav className="flex flex-col gap-2">
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-xl text-gray-500 font-medium">
                    <LayoutGrid className="w-5 h-5" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/stockpile" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-xl text-gray-500 font-medium">
                    <ShoppingBag className="w-5 h-5" />
                    Stockpile
                  </Button>
                </Link>
                <Link to="/customers" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-xl bg-orange-50 text-cartlist-orange font-bold">
                    <Users className="w-5 h-5" />
                    Customers
                  </Button>
                </Link>
                <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-xl text-gray-500 font-medium">
                    <SettingsIcon className="w-5 h-5" />
                    Settings
                  </Button>
                </Link>
              </nav>
              <div className="mt-auto pt-6 border-t border-gray-100">
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="w-full justify-start gap-3 h-12 rounded-xl text-red-500 font-medium hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="max-w-[1600px] mx-auto p-4 md:p-8">
        {/* Profile Header Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-10">
          <div className="flex items-center gap-6">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-2xl border-gray-200 hover:bg-white shrink-0"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                <img 
                  src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${data.customer.name}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{data.customer.name}</h2>
                  {data.customer.hasActiveStockpile && (
                    <div className="flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1 rounded-full border border-green-100">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Active stockpile</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-muted-foreground font-medium">{data.customer.email || "No email provided"}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground font-medium">{data.customer.phone}</p>
                    <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full text-gray-400 hover:text-cartlist-orange">
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
            <Button 
              onClick={() => setIsLogDrawerOpen(true)}
              className="bg-cartlist-orange hover:bg-orange-600 text-white rounded-full px-6 h-12 font-bold gap-2 shadow-lg shadow-orange-100"
            >
              <FileText className="w-5 h-5" />
              Log a Purchase
            </Button>
            <Button 
              variant="outline"
              className="bg-white border-gray-200 hover:bg-gray-50 rounded-full h-12 px-6 font-bold gap-2"
              onClick={() => window.open(`https://wa.me/${data.customer.phone.replace(/\D/g, '')}`, '_blank')}
            >
              <MessageSquare className="w-5 h-5 text-green-500" />
              Send message
            </Button>
            <Button 
              variant="outline"
              className="bg-white border-gray-200 hover:bg-gray-50 rounded-full h-12 px-6 font-bold gap-2"
              onClick={copyToClipboard}
            >
              {copySuccess ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <LinkIcon className="w-5 h-5 text-blue-500" />}
              {copySuccess ? "Copied!" : "Copy link"}
            </Button>
            <Button 
              variant="ghost"
              className="text-red-500 hover:bg-red-50 hover:text-red-600 font-bold px-4"
              onClick={handleRemoveClick}
            >
              Remove client
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total amount purchased", value: `₦${data.stats.totalAmountPurchased.toLocaleString()}`, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Delivery paid", value: data.customer.deliveryPaid ? "Yes" : "No", icon: ShoppingBag, color: "text-pink-500", bg: "bg-pink-50" },
            { label: "Time spent in stockpile", value: `${data.stats.avgTimeSpent} days`, icon: Plus, color: "text-purple-500", bg: "bg-purple-50" },
            { label: "Average amount of item", value: `₦${data.stats.avgItemPrice.toLocaleString()}`, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
          ].map((stat, i) => (
            <Card key={i} className="p-6 border-none shadow-sm bg-white rounded-[24px] flex flex-col items-center text-center gap-4">
              <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Purchase History Table */}
          <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
            <div className="p-8 border-b border-orange-50 flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-cartlist-orange" />
              <h3 className="text-xl font-bold text-gray-900">Purchase history</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-muted-foreground text-[10px] uppercase tracking-wider font-bold">
                    <th className="px-8 py-4">Name of item</th>
                    <th className="px-4 py-4">Quantity</th>
                    <th className="px-4 py-4">Price</th>
                    <th className="px-4 py-4">Date</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Mark as delivered</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.history.map((item, i) => (
                    <tr key={i} className="hover:bg-orange-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-gray-900">{item.name}</p>
                      </td>
                      <td className="px-4 py-6">
                        <p className="text-sm font-medium text-gray-600">{item.quantity}</p>
                      </td>
                      <td className="px-4 py-6">
                        <p className="text-sm font-bold text-gray-900">₦{item.price.toLocaleString()}</p>
                      </td>
                      <td className="px-4 py-6">
                        <p className="text-sm font-bold text-gray-900">{format(new Date(item.date), "hh:mm a")}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{format(new Date(item.date), "do MMM, yyyy")}</p>
                      </td>
                      <td className="px-4 py-6">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit ${
                          item.status === "Delivered" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{item.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-6">
                        <Switch 
                          checked={item.isDelivered} 
                          onCheckedChange={() => handleToggleDelivery(item._id)}
                          className="data-[state=checked]:bg-cartlist-orange"
                        />
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {data.history.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-8 py-20 text-center">
                        <p className="text-muted-foreground font-medium">No purchase history found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Note Section */}
          <Card className="border-none shadow-sm bg-white rounded-[32px] p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-cartlist-orange" />
              <h3 className="text-xl font-bold text-gray-900">Short Note</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-8">Create a short description about this customer.</p>
            
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Note</label>
                <div className="relative">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value.slice(0, 200))}
                    placeholder="Write note"
                    className="w-full h-64 p-6 rounded-[24px] border border-gray-100 bg-white focus:outline-none focus:ring-2 focus:ring-cartlist-orange/20 focus:border-cartlist-orange transition-all text-sm resize-none"
                  />
                  <span className="absolute bottom-4 right-6 text-[10px] font-medium text-gray-400">
                    {note.length}/200
                  </span>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSaveNote}
              disabled={isSavingNote}
              className={`w-full h-14 mt-8 rounded-full font-bold transition-all ${
                showNoteSuccess 
                  ? "bg-green-50 text-green-600" 
                  : "bg-gray-50 hover:bg-orange-50 text-gray-400 hover:text-cartlist-orange"
              }`}
            >
              {isSavingNote ? "Saving..." : showNoteSuccess ? "Note saved successfully!" : "Save note"}
            </Button>
          </Card>
        </div>
      </main>

      <LogPurchaseDrawer 
        isOpen={isLogDrawerOpen} 
        onClose={() => setIsLogDrawerOpen(false)}
        initialData={{
          customerName: data.customer.name,
          customerPhone: data.customer.phone,
          customerEmail: data.customer.email
        }}
        onSuccess={() => {
          setIsLogDrawerOpen(false);
          fetchCustomerDetails();
        }}
      />

      <RemoveCustomerModal 
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        onConfirm={handleConfirmRemove}
      />
    </div>
  );
}
