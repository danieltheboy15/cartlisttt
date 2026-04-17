import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Users, 
  ShoppingBag, 
  Truck, 
  Clock, 
  Search,
  Bell,
  ChevronDown,
  MoreVertical,
  LayoutGrid,
  Menu,
  X,
  Settings as SettingsIcon,
  LogOut,
  Filter,
  Calendar,
  Phone,
  Mail,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Eye,
  Edit2,
  BellRing,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer 
} from "recharts";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { Header } from "../components/Header";
import { useEffect, useState } from "react";
import { Logo } from "./Landing";
import { LogPurchaseDrawer } from "../components/LogPurchaseDrawer";
import { SuccessModal } from "../components/SuccessModal";
import { StockpileDetailsModal } from "../components/StockpileDetailsModal";
import { ConfirmationModal } from "../components/ConfirmationModal";

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

const StockpileStatsSidebar = ({ stats }: { stats: any }) => {
  if (!stats) return null;

  const deliveryData = [
    { name: 'Paid', value: stats.deliveryPaidCount || 0 },
    { name: 'Unpaid', value: stats.deliveryUnpaidCount || 0 },
  ];

  const quantityData = [
    { name: 'Open', value: stats.openStockpileCount },
    { name: 'Closed', value: stats.closedStockpileCount },
  ];

  const COLORS = ['#F97316', '#E5E7EB']; // Orange and Gray

  return (
    <div className="space-y-6">
      {/* Delivery Status Card */}
      <Card className="border-none shadow-sm bg-white rounded-[32px] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Truck className="w-5 h-5 text-gray-400" />
          <h3 className="font-bold text-lg">Delivery status</h3>
        </div>
        
        <div className="relative h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={deliveryData}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={80}
                outerRadius={120}
                paddingAngle={0}
                dataKey="value"
              >
                {deliveryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Deliveries</p>
            <p className="text-xl font-black">{stats.totalStockpileCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-orange-50">
          <div className="text-center">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center mx-auto mb-2">
              <AlertCircle className="w-4 h-4 text-cartlist-orange" />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Unpaid</p>
            <p className="font-black text-sm">{stats.deliveryUnpaidCount}</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Paid</p>
            <p className="font-black text-sm">{stats.deliveryPaidCount}</p>
          </div>
        </div>
      </Card>

      {/* Stockpile Quantity Card */}
      <Card className="border-none shadow-sm bg-white rounded-[32px] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-5 h-5 text-gray-400" />
          <h3 className="font-bold text-lg">Stockpile quantity</h3>
        </div>
        
        <div className="relative h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={quantityData}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={80}
                outerRadius={120}
                paddingAngle={0}
                dataKey="value"
              >
                {quantityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">All stockpile</p>
            <p className="text-xl font-black">{stats.totalStockpileCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-orange-50">
          <div className="text-center">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center mx-auto mb-2">
              <ShoppingBag className="w-4 h-4 text-cartlist-orange" />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Open stockpile</p>
            <p className="font-black text-sm">{stats.openStockpileCount}</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mx-auto mb-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Closed stockpile</p>
            <p className="font-black text-sm">{stats.closedStockpileCount}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default function Stockpiles() {
  const navigate = useNavigate();
  const { user, logout, fetchWithAuth } = useAuth();
  const { showToast } = useToast();
  const [stockpiles, setStockpiles] = useState<Stockpile[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("newest");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const [selectedStockpile, setSelectedStockpile] = useState<Stockpile | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [editStockpile, setEditStockpile] = useState<Stockpile | null>(null);
  const [logDrawerMode, setLogDrawerMode] = useState<"create" | "edit" | "add-items">("create");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isReminding, setIsReminding] = useState<string | null>(null);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: "delete" | "bulk-delete" | "bulk-close" | null;
    targetId?: string;
    variant: "danger" | "warning" | "info";
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: null,
    variant: "danger",
    isLoading: false
  });

  const fetchStockpiles = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`/api/stockpiles?status=${statusFilter}&search=${search}&filter=${sortFilter}`);
      if (response.ok) {
        const data = await response.json();
        setStockpiles(data);
      }
      
      const statsResponse = await fetchWithAuth('/api/stockpiles/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Failed to fetch stockpiles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStockpiles();
    }, 300);
    
    // Real-time polling every 30 seconds
    const interval = setInterval(() => {
      fetchStockpiles();
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [search, statusFilter, sortFilter]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "closed" : "active";
    try {
      const response = await fetchWithAuth(`/api/stockpiles/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        fetchStockpiles();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const deleteStockpile = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Stockpile",
      message: "Are you sure you want to delete this stockpile record? This action cannot be undone.",
      variant: "danger",
      action: "delete",
      targetId: id
    });
  };

  const handleConfirm = async () => {
    if (!confirmModal.action) return;
    
    setConfirmModal(prev => ({ ...prev, isLoading: true }));
    if (confirmModal.action.startsWith("bulk-")) {
      setIsBulkUpdating(true);
    }

    try {
      if (confirmModal.action === "delete" && confirmModal.targetId) {
        const response = await fetchWithAuth(`/api/stockpiles/${confirmModal.targetId}`, {
          method: "DELETE"
        });
        if (response.ok) {
          fetchStockpiles();
        }
      } else if (confirmModal.action === "bulk-delete") {
        const response = await fetchWithAuth("/api/stockpiles/bulk-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds })
        });
        if (response.ok) {
          setSelectedIds([]);
          fetchStockpiles();
        }
      } else if (confirmModal.action === "bulk-close") {
        const response = await fetchWithAuth("/api/stockpiles/bulk-status", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds, status: "closed" })
        });
        if (response.ok) {
          setSelectedIds([]);
          fetchStockpiles();
        }
      }
      setConfirmModal(prev => ({ ...prev, isOpen: false, action: null, isLoading: false }));
    } catch (error) {
      console.error("Action failed:", error);
      setConfirmModal(prev => ({ ...prev, isLoading: false }));
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkStatusUpdate = async (status: "active" | "closed") => {
    if (selectedIds.length === 0) return;

    if (status === "closed") {
      setConfirmModal({
        isOpen: true,
        title: "Close Stockpiles",
        message: `Are you sure you want to mark ${selectedIds.length} stockpiles as closed?`,
        variant: "warning",
        action: "bulk-close"
      });
      return;
    }

    setIsBulkUpdating(true);
    try {
      const response = await fetchWithAuth("/api/stockpiles/bulk-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, status })
      });
      if (response.ok) {
        setSelectedIds([]);
        fetchStockpiles();
      }
    } catch (error) {
      console.error("Bulk status update failed:", error);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    setConfirmModal({
      isOpen: true,
      title: "Delete Stockpiles",
      message: `Are you sure you want to delete ${selectedIds.length} stockpiles? This action cannot be undone.`,
      variant: "danger",
      action: "bulk-delete"
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === stockpiles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(stockpiles.map(s => s._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const sendReminder = async (stockpile: Stockpile) => {
    setIsReminding(stockpile._id);
    try {
      const response = await fetchWithAuth(`/api/stockpiles/${stockpile._id}/remind`, {
        method: "POST"
      });
      if (response.ok) {
        showToast("Reminder sent");
        console.log(`Reminder sent to ${stockpile.customerName} successfully!`);
      } else {
        console.error("Failed to send reminder");
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
    } finally {
      setIsReminding(null);
    }
  };

  return (
    <div className="min-h-screen dashboard-bg font-sans">
      <Header />

      <main className="max-w-[1600px] mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading mb-2">Stockpile</h1>
            <p className="text-muted-foreground">you can view and manage your stockpile here</p>
          </div>
          <div className="flex items-center gap-4">
            <AnimatePresence>
              {selectedIds.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="flex items-center gap-2 bg-white border border-orange-100 p-1.5 rounded-full shadow-lg"
                >
                  <div className="px-4 py-1.5 bg-orange-50 rounded-full">
                    <span className="text-sm font-black text-cartlist-orange">{selectedIds.length} selected</span>
                  </div>
                  <div className="h-6 w-px bg-orange-100 mx-1" />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleBulkStatusUpdate("closed")}
                    className="rounded-full hover:bg-green-50 hover:text-green-600 font-bold gap-2"
                    disabled={isBulkUpdating}
                  >
                    {isBulkUpdating && confirmModal.action === "bulk-close" ? (
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Close
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleBulkDelete}
                    className="rounded-full hover:bg-red-50 hover:text-red-600 font-bold gap-2"
                    disabled={isBulkUpdating}
                  >
                    {isBulkUpdating && confirmModal.action === "bulk-delete" ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedIds([])}
                    className="rounded-full hover:bg-gray-50 font-bold"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <Button 
              onClick={() => {
                setEditStockpile(null);
                setLogDrawerMode("create");
                setIsLogDrawerOpen(true);
              }}
              className="bg-cartlist-orange hover:bg-orange-600 text-white rounded-full px-8 h-12 font-bold gap-2 shadow-lg shadow-orange-200"
            >
              <Plus className="w-5 h-5" />
              New Stockpile
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Search ..." 
                  className="pl-12 h-12 bg-white border-orange-50 rounded-2xl focus-visible:ring-cartlist-orange shadow-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <Select value={sortFilter} onValueChange={setSortFilter}>
                  <SelectTrigger className="w-[160px] h-12 bg-white border-orange-50 rounded-2xl font-bold shadow-sm">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <SelectValue placeholder="Filter" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl p-2 border-orange-100">
                    <SelectItem value="today" className="rounded-xl">Today</SelectItem>
                    <SelectItem value="oldest" className="rounded-xl">Oldest to Newest</SelectItem>
                    <SelectItem value="newest" className="rounded-xl">Newest to Oldest</SelectItem>
                    <SelectItem value="thisMonth" className="rounded-xl">This month</SelectItem>
                    <SelectItem value="closingSoon" className="rounded-xl">Closing soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stockpiles Table */}
            <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 text-muted-foreground text-[10px] uppercase tracking-wider font-bold">
                      <th className="pl-6 md:pl-8 py-4 w-10">
                        <div 
                          onClick={toggleSelectAll}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
                            selectedIds.length > 0 && selectedIds.length === stockpiles.length
                              ? "bg-cartlist-orange border-cartlist-orange"
                              : selectedIds.length > 0
                              ? "bg-orange-200 border-cartlist-orange"
                              : "border-gray-300 hover:border-cartlist-orange"
                          }`}
                        >
                          {selectedIds.length > 0 && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-4 flex items-center gap-2">Clients <ChevronDown className="w-3 h-3" /></th>
                      <th className="px-4 py-4">Amount <ChevronDown className="w-3 h-3" /></th>
                      <th className="px-4 py-4">Date stockpiled</th>
                      <th className="hidden md:table-cell px-4 py-4">Days remaining</th>
                      <th className="hidden md:table-cell px-4 py-4">Last updated</th>
                      <th className="hidden md:table-cell px-4 py-4">Status</th>
                      <th className="hidden md:table-cell px-4 py-4">Delivery</th>
                      <th className="px-6 md:px-8 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={9} className="px-6 py-8">
                            <div className="h-10 bg-gray-100 rounded-xl w-full" />
                          </td>
                        </tr>
                      ))
                    ) : stockpiles.length > 0 ? (
                      stockpiles.map((stockpile) => (
                        <tr 
                          key={stockpile._id} 
                          className={`transition-all duration-200 group cursor-pointer border-l-4 ${
                            selectedIds.includes(stockpile._id) 
                              ? "bg-orange-50/60 border-cartlist-orange" 
                              : "hover:bg-gray-50/80 border-transparent"
                          }`}
                          onClick={() => {
                            setSelectedStockpile(stockpile);
                            setIsDetailsModalOpen(true);
                          }}
                        >
                          <td className="pl-6 md:pl-8 py-5" onClick={(e) => e.stopPropagation()}>
                            <div 
                              onClick={() => toggleSelect(stockpile._id)}
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                                selectedIds.includes(stockpile._id)
                                  ? "bg-cartlist-orange border-cartlist-orange scale-110 shadow-sm shadow-orange-200"
                                  : "border-gray-300 group-hover:border-cartlist-orange/50"
                              }`}
                            >
                              {selectedIds.includes(stockpile._id) && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                <img src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${stockpile.customerName}`} alt="Avatar" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900 group-hover:text-cartlist-orange transition-colors">{stockpile.customerName}</p>
                                <p className="text-[10px] text-muted-foreground font-medium">{stockpile.customerPhone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <p className="text-sm font-black text-gray-900">₦{stockpile.totalAmount.toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{stockpile.items.length} items</p>
                          </td>
                          <td className="px-4 py-5">
                            <p className="text-sm font-bold text-gray-700">{new Date(stockpile.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">
                              {new Date(stockpile.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(stockpile.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </td>
                          <td className="hidden md:table-cell px-4 py-5 w-40">
                            {(() => {
                              const start = new Date(stockpile.createdAt).getTime();
                              const end = new Date(stockpile.endDate).getTime();
                              const now = new Date().getTime();
                              const total = end - start;
                              const elapsed = now - start;
                              const progress = Math.min(100, Math.max(0, Math.floor((elapsed / total) * 100)));
                              const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
                              return (
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        daysLeft <= 2 ? "bg-red-500" : daysLeft <= 5 ? "bg-yellow-500" : "bg-cartlist-orange"
                                      }`} 
                                      style={{ width: `${progress}%` }} 
                                    />
                                  </div>
                                  <span className={`text-[10px] font-black whitespace-nowrap ${
                                    daysLeft <= 2 ? "text-red-500" : "text-muted-foreground"
                                  }`}>{daysLeft}d</span>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="hidden md:table-cell px-4 py-5">
                            <p className="text-sm font-bold text-gray-600">
                              {(() => {
                                const diff = new Date().getTime() - new Date(stockpile.updatedAt).getTime();
                                const minutes = Math.floor(diff / (1000 * 60));
                                const hours = Math.floor(diff / (1000 * 60 * 60));
                                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                
                                if (minutes < 1) return "Just now";
                                if (minutes < 60) return `${minutes}m ago`;
                                if (hours < 24) return `${hours}h ago`;
                                if (days === 1) return "Yesterday";
                                return `${days}d ago`;
                              })()}
                            </p>
                          </td>
                          <td className="hidden md:table-cell px-4 py-5">
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl w-fit font-bold border ${
                              stockpile.status === "active" 
                                ? "bg-orange-50 text-cartlist-orange border-orange-100 shadow-sm shadow-orange-50" 
                                : "bg-green-50 text-green-600 border-green-100 shadow-sm shadow-green-50"
                            }`}>
                              {stockpile.status === "active" ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                              <span className="text-[10px] uppercase tracking-wider">{stockpile.status === "active" ? "In Progress" : "Closed"}</span>
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-4 py-5">
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl w-fit font-bold border ${
                              stockpile.deliveryPaid 
                                ? "bg-blue-50 text-blue-600 border-blue-100 shadow-sm shadow-blue-50" 
                                : "bg-red-50 text-red-600 border-red-100 shadow-sm shadow-red-50"
                            }`}>
                              {stockpile.deliveryPaid ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                              <span className="text-[10px] uppercase tracking-wider">
                                {stockpile.deliveryPaid ? "Paid" : "Unpaid"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 md:px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-orange-50 transition-colors">
                                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-2xl p-2 border-orange-100 shadow-xl bg-white z-[200]">
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedStockpile(stockpile);
                                    setIsDetailsModalOpen(true);
                                  }}
                                  className="rounded-xl px-3 py-2 cursor-pointer flex items-center gap-3 hover:bg-orange-50 group/item"
                                >
                                  <Eye className="w-4 h-4 text-gray-400 group-hover/item:text-cartlist-orange" />
                                  <span className="font-medium">View</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditStockpile(stockpile);
                                    setLogDrawerMode("add-items");
                                    setIsLogDrawerOpen(true);
                                  }}
                                  className="rounded-xl px-3 py-2 cursor-pointer flex items-center gap-3 hover:bg-orange-50 group/item"
                                >
                                  <Plus className="w-4 h-4 text-gray-400 group-hover/item:text-cartlist-orange" />
                                  <span className="font-medium">Add to stockpile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditStockpile(stockpile);
                                    setLogDrawerMode("edit");
                                    setIsLogDrawerOpen(true);
                                  }}
                                  className="rounded-xl px-3 py-2 cursor-pointer flex items-center gap-3 hover:bg-orange-50 group/item"
                                >
                                  <Edit2 className="w-4 h-4 text-gray-400 group-hover/item:text-cartlist-orange" />
                                  <span className="font-medium">Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const url = `${window.location.origin}/view/${stockpile._id}`;
                                    navigator.clipboard.writeText(url);
                                    showToast("Copied to clipboard");
                                    console.log("Link copied to clipboard!");
                                  }}
                                  className="rounded-xl px-3 py-2 cursor-pointer flex items-center gap-3 hover:bg-orange-50 group/item"
                                >
                                  <Copy className="w-4 h-4 text-gray-400 group-hover/item:text-cartlist-orange" />
                                  <span className="font-medium">Copy link</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    sendReminder(stockpile);
                                  }}
                                  disabled={isReminding === stockpile._id}
                                  className="rounded-xl px-3 py-2 cursor-pointer flex items-center gap-3 hover:bg-orange-50 group/item"
                                >
                                  {isReminding === stockpile._id ? (
                                    <div className="w-4 h-4 border-2 border-cartlist-orange border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <BellRing className="w-4 h-4 text-gray-400 group-hover/item:text-cartlist-orange" />
                                  )}
                                  <span className="font-medium">{isReminding === stockpile._id ? "Sending..." : "Reminder"}</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-orange-50 my-1" />
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteStockpile(stockpile._id);
                                  }}
                                  className="rounded-xl px-3 py-2 cursor-pointer flex items-center gap-3 text-red-500 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className="font-medium">Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="px-6 py-20 text-center">
                          <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                          <p className="text-muted-foreground font-medium">No stockpiles found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-6 border-t border-orange-50 flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-xl border-orange-100 h-10 px-4 font-bold text-gray-500 hover:bg-orange-50">
                    Previous
                  </Button>
                  <Button variant="outline" className="rounded-xl border-orange-100 h-10 px-4 font-bold text-gray-500 hover:bg-orange-50">
                    Next
                  </Button>
                </div>
                <p className="text-sm font-bold text-gray-400">Page 1 of 10</p>
              </div>
            </Card>
          </div>

          {/* Sidebar Stats */}
          <div className="lg:col-span-1">
            <StockpileStatsSidebar stats={stats} />
          </div>
        </div>
      </main>

      <LogPurchaseDrawer 
        isOpen={isLogDrawerOpen} 
        title={logDrawerMode === "add-items" ? "Add to stockpile" : editStockpile ? "Edit stockpile" : "New Stockpile"}
        mode={logDrawerMode}
        onClose={() => {
          setIsLogDrawerOpen(false);
          setEditStockpile(null);
          setLogDrawerMode("create");
        }}
        onSuccess={(data) => {
          fetchStockpiles();
          setSuccessData({ ...data, isUpdate: logDrawerMode === "add-items" });
          setIsSuccessModalOpen(true);
        }}
        initialData={editStockpile}
      />

      <SuccessModal 
        isOpen={isSuccessModalOpen} 
        onClose={() => {
          setIsSuccessModalOpen(false);
          setSuccessData(null);
        }} 
        data={successData}
        onLogAnother={() => {
          setIsSuccessModalOpen(false);
          setSuccessData(null);
          setIsLogDrawerOpen(true);
        }}
      />

      <StockpileDetailsModal 
        stockpile={selectedStockpile}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onUpdate={() => {
          fetchStockpiles();
          // Refresh selected stockpile data if it's open
          if (selectedStockpile) {
            fetchWithAuth(`/api/stockpiles/${selectedStockpile._id}`)
              .then(res => res.json())
              .then(data => setSelectedStockpile(data));
          }
        }}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        isLoading={confirmModal.isLoading}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false, action: null }))}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
