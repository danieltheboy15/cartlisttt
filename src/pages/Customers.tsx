import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Users, 
  ShoppingBag, 
  Search,
  Bell,
  ChevronDown,
  MoreVertical,
  Menu,
  X,
  Settings,
  LogOut,
  Filter,
  Phone,
  Mail,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Download,
  Eye,
  MessageSquare,
  UserMinus,
  ArrowUpDown,
  LayoutGrid
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import { Header } from "../components/Header";
import { useEffect, useState } from "react";
import { Logo } from "./Landing";

interface Customer {
  phone: string;
  name: string;
  email?: string;
  totalSpend: number;
  totalItems: number;
  lastPurchaseDate: string;
  firstPurchaseDate: string;
  status: "active" | "inactive";
  hasUnpaidDelivery: boolean;
}

export default function Customers() {
  const navigate = useNavigate();
  const { user, logout, fetchWithAuth } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth("/api/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
    
    return matchesSearch;
  });

  const exportToCSV = () => {
    const headers = ["Name", "Phone", "Email", "Total Spend", "Last Purchase", "Status"];
    const rows = filteredCustomers.map(c => [
      c.name,
      c.phone,
      c.email || "",
      c.totalSpend,
      new Date(c.lastPurchaseDate).toLocaleDateString(),
      c.status
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "customers.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen dashboard-bg font-sans">
      <Header />

      <main className="max-w-[1600px] mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading mb-2">Customers</h1>
            <p className="text-muted-foreground">Manage customer's profile and orders</p>
          </div>
          <Button 
            onClick={exportToCSV}
            variant="outline"
            className="rounded-full border-gray-200 h-12 px-6 font-bold gap-2 hover:bg-orange-50 hover:border-orange-100 transition-all"
          >
            <Download className="w-5 h-5" />
            Export to CSV
          </Button>
        </div>

        <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
          {/* Table Header / Search */}
          <div className="p-6 md:p-8 border-b border-orange-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Customers ({filteredCustomers.length})</h2>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Search ..." 
                  className="pl-12 h-12 bg-[#FDF8F3]/50 border-orange-50 rounded-2xl focus-visible:ring-cartlist-orange"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-muted-foreground text-[10px] uppercase tracking-wider font-bold">
                  <th className="px-6 md:px-8 py-4">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-cartlist-orange transition-colors">
                      Clients <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-4 py-4">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-cartlist-orange transition-colors">
                      Email <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-4 py-4">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-cartlist-orange transition-colors">
                      Total spend <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-4 py-4">Last purchase date</th>
                  <th className="px-4 py-4">Period active</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-6 md:px-8 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={7} className="px-6 py-8">
                          <div className="h-12 bg-gray-100 rounded-2xl w-full" />
                        </td>
                      </tr>
                    ))
                  ) : filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <tr 
                        key={customer.phone} 
                        className="hover:bg-orange-50/30 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/customers/${customer.phone}`)}
                      >
                        <td className="px-6 md:px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border border-orange-50">
                            <img src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${customer.name}`} alt="Avatar" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{customer.name}</p>
                            <p className="text-[10px] text-muted-foreground">{customer.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-sm font-medium text-gray-600">{customer.email || "No email provided"}</p>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-sm font-bold text-gray-900">₦{customer.totalSpend.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">({customer.totalItems} items)</p>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-sm font-bold text-gray-900">
                          {new Date(customer.lastPurchaseDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          {new Date(customer.lastPurchaseDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-sm font-bold text-gray-900">
                          {Math.ceil((new Date().getTime() - new Date(customer.firstPurchaseDate).getTime()) / (1000 * 60 * 60 * 24))} Days
                        </p>
                      </td>
                      <td className="px-4 py-5">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit ${
                          customer.status === "active" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                        }`}>
                          {customer.status === "active" ? <CheckCircle2 className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            {customer.status === "active" ? "Active stockpile" : "Inactive stockpile"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 md:px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-orange-50">
                              <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl p-2 border-orange-100 shadow-xl bg-white z-[200]">
                            <DropdownMenuItem 
                              onClick={() => navigate(`/customers/${customer.phone}`)}
                              className="rounded-xl px-3 py-2 cursor-pointer flex items-center gap-3 hover:bg-orange-50 group"
                            >
                              <Eye className="w-4 h-4 text-gray-400 group-hover:text-cartlist-orange" />
                              <span className="font-medium">View</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => window.open(`https://wa.me/${customer.phone.replace(/\D/g, '')}`, '_blank')}
                              className="rounded-xl px-3 py-2 cursor-pointer flex items-center gap-3 hover:bg-orange-50 group"
                            >
                              <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-cartlist-orange" />
                              <span className="font-medium">Message</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-orange-50 my-1" />
                            <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer flex items-center gap-3 text-red-500 hover:bg-red-50">
                              <UserMinus className="w-4 h-4" />
                              <span className="font-medium">Remove</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-muted-foreground font-medium">No customers found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 md:p-8 border-t border-orange-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
      </main>
    </div>
  );
}
