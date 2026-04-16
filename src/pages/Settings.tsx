import React, { useEffect, useState } from "react";
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
  Settings as SettingsIcon,
  LogOut,
  LayoutGrid,
  Edit2,
  Globe,
  Clock,
  DollarSign,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../contexts/AuthContext";
import { Header } from "../components/Header";
import { Logo } from "./Landing";

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout, fetchWithAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingSecurity, setIsEditingSecurity] = useState(false);
  const [originalGender, setOriginalGender] = useState("");

  // Profile Form State
  const [profileData, setProfileData] = useState({
    businessName: "",
    ownerName: "",
    firstName: "",
    lastName: "",
    email: "",
    whatsappNumber: "",
    gender: "",
    businessCategory: "",
    language: "English",
    timezone: "+1 GMT",
    currency: "Naira"
  });

  // Notification State
  const [notificationSettings, setNotificationSettings] = useState({
    stockpileUpdates: { email: true, sms: true, push: true, inApp: true },
    reminders: { email: true, sms: true, push: true, inApp: true },
    customerActivity: { email: true, sms: false, push: true, inApp: true },
    systemAlerts: { email: true, sms: false, push: true, inApp: true }
  });

  // Security State
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showOtherCategory, setShowOtherCategory] = useState(false);
  const [otherCategoryValue, setOtherCategoryValue] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const categories = ["Food", "Fashion", "Beauty", "Baby Products", "Household", "Other"];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetchWithAuth("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setProfileData({
            businessName: data.businessName || "",
            ownerName: data.ownerName || "",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            whatsappNumber: data.whatsappNumber || "",
            gender: data.gender || "",
            businessCategory: data.businessCategory || "",
            language: data.language || "English",
            timezone: data.timezone || "+1 GMT",
            currency: data.currency || "Naira"
          });
          setOriginalGender(data.gender || "");
          if (data.notifications) {
            // Merge with defaults to handle missing fields in old user objects
            setNotificationSettings({
              stockpileUpdates: { ...notificationSettings.stockpileUpdates, ...(data.notifications.stockpileUpdates || {}) },
              reminders: { ...notificationSettings.reminders, ...(data.notifications.reminders || {}) },
              customerActivity: { ...notificationSettings.customerActivity, ...(data.notifications.customerActivity || {}) },
              systemAlerts: { ...notificationSettings.systemAlerts, ...(data.notifications.systemAlerts || {}) }
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const finalBusinessCategory = profileData.businessCategory === "Other" ? otherCategoryValue : profileData.businessCategory;
      const response = await fetchWithAuth("/api/user/profile", {
        method: "PATCH",
        body: JSON.stringify({ 
          ...profileData, 
          businessCategory: finalBusinessCategory,
          notifications: notificationSettings 
        })
      });
      if (response.ok) {
        setMessage({ type: "success", text: "Settings updated successfully!" });
        setOriginalGender(profileData.gender);
        setIsEditingProfile(false);
      } else {
        setMessage({ type: "error", text: "Failed to update settings." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred." });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    setIsSaving(true);
    setMessage(null);
    try {
      const response = await fetchWithAuth("/api/user/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: securityData.currentPassword,
          newPassword: securityData.newPassword
        })
      });
      if (response.ok) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setIsEditingSecurity(false);
      } else {
        const data = await response.json();
        setMessage({ type: "error", text: data.message || "Failed to change password." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred." });
    } finally {
      setIsSaving(false);
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

  return (
    <div className="min-h-screen dashboard-bg font-sans">
      <Header />

      <main className="max-w-[1200px] mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage customer's profile and orders</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-8" onValueChange={setActiveTab}>
          <TabsList className="bg-[#F3EBE3] p-1 rounded-2xl w-fit h-auto">
            <TabsTrigger value="profile" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-white data-[state=active]:text-cartlist-orange data-[state=active]:shadow-sm font-bold transition-all">
              Profile
            </TabsTrigger>
            <TabsTrigger value="notification" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-white data-[state=active]:text-cartlist-orange data-[state=active]:shadow-sm font-bold transition-all">
              Notification
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-white data-[state=active]:text-cartlist-orange data-[state=active]:shadow-sm font-bold transition-all">
              Security
            </TabsTrigger>
          </TabsList>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl flex items-center gap-3 ${
                message.type === "success" ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
              }`}
            >
              {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <p className="font-medium text-sm">{message.text}</p>
              <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 rounded-full" onClick={() => setMessage(null)}>
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          <TabsContent value="profile" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
                <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">Personal information</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">These are your personal details, they are visible to the public</p>
                  </div>
                  {!isEditingProfile && (
                    <Button 
                      onClick={() => setIsEditingProfile(true)}
                      variant="outline" 
                      className="rounded-full border-orange-100 gap-2 font-bold text-gray-500 hover:bg-orange-50"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                      <img src={user?.profilePicture || "https://raw.githubusercontent.com/DannyYo696/svillage/29b4c24e6ca88b3ecf3856f30fceb3f29eef40bf/profile%20picture.webp"} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{profileData.businessName || user?.businessName}</h3>
                      <p className="text-muted-foreground">{profileData.email || user?.email}</p>
                    </div>
                  </div>

                  <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Business name</label>
                      <Input 
                        value={profileData.businessName || user?.businessName || ""}
                        readOnly
                        className="h-12 bg-gray-50 border-gray-100 rounded-2xl text-gray-400 cursor-not-allowed"
                        placeholder="Business Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Email</label>
                      <Input 
                        value={profileData.email || user?.email || ""}
                        readOnly
                        className="h-12 bg-gray-50 border-gray-100 rounded-2xl text-gray-400 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">First name</label>
                      <Input 
                        value={profileData.firstName || user?.firstName || ""}
                        readOnly
                        className="h-12 bg-gray-50 border-gray-100 rounded-2xl text-gray-400 cursor-not-allowed"
                        placeholder="First Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Last name</label>
                      <Input 
                        value={profileData.lastName || user?.lastName || ""}
                        readOnly
                        className="h-12 bg-gray-50 border-gray-100 rounded-2xl text-gray-400 cursor-not-allowed"
                        placeholder="Last Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Phone number</label>
                      <div className="flex gap-2">
                        <Select defaultValue="+234" disabled>
                          <SelectTrigger className="w-[100px] h-12 bg-gray-50 border-gray-100 rounded-2xl text-gray-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-orange-50">
                            <SelectItem value="+234">🇳🇬 +234</SelectItem>
                            <SelectItem value="+1">🇺🇸 +1</SelectItem>
                            <SelectItem value="+44">🇬🇧 +44</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input 
                          value={profileData.whatsappNumber}
                          readOnly
                          className="flex-1 h-12 bg-gray-50 border-gray-100 rounded-2xl text-gray-400 cursor-not-allowed"
                          placeholder="(555) 000-0000"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Gender</label>
                      <Select 
                        value={profileData.gender} 
                        onValueChange={(val) => setProfileData({ ...profileData, gender: val })}
                        disabled={!isEditingProfile}
                      >
                        <SelectTrigger className={`w-full h-12 border-orange-50 rounded-2xl ${!isEditingProfile ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-[#FDF8F3]/50"}`}>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-orange-50">
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Business category</label>
                      <Select 
                        value={categories.includes(profileData.businessCategory) ? profileData.businessCategory : (profileData.businessCategory ? "Other" : "")} 
                        onValueChange={(val) => {
                          setProfileData({ ...profileData, businessCategory: val });
                          if (val === "Other") {
                            setShowOtherCategory(true);
                            if (!categories.includes(profileData.businessCategory)) {
                              setOtherCategoryValue(profileData.businessCategory);
                            }
                          } else {
                            setShowOtherCategory(false);
                          }
                        }}
                        disabled={!isEditingProfile}
                      >
                        <SelectTrigger className={`w-full h-12 border-orange-50 rounded-2xl ${!isEditingProfile ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-[#FDF8F3]/50"}`}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-orange-50">
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <AnimatePresence>
                      {(showOtherCategory || (profileData.businessCategory && !categories.includes(profileData.businessCategory))) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 overflow-hidden md:col-span-2"
                        >
                          <label className="text-sm font-bold text-gray-700">Custom business category</label>
                          <Input 
                            value={otherCategoryValue || (!categories.includes(profileData.businessCategory) ? profileData.businessCategory : "")}
                            onChange={(e) => setOtherCategoryValue(e.target.value)}
                            readOnly={!isEditingProfile}
                            className={`h-12 border-orange-50 rounded-2xl ${!isEditingProfile ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-[#FDF8F3]/50"}`}
                            placeholder="e.g. Electronics"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                  {isEditingProfile && profileData.gender !== originalGender && (
                    <div className="pt-4">
                      <Button 
                        onClick={handleProfileUpdate}
                        disabled={isSaving}
                        className="bg-cartlist-orange hover:bg-orange-600 text-white rounded-full px-10 h-12 font-bold gap-2 shadow-lg shadow-orange-200"
                      >
                        {isSaving ? "Saving..." : "Save changes"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* General Preference */}
              <div className="space-y-8">
                <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-bold">General preference</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">These are your personal details, they are visible to the public</p>
                  </CardHeader>
                  <CardContent className="p-8 pt-4 space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Language</label>
                      <Select 
                        value={profileData.language}
                        onValueChange={(val) => setProfileData({ ...profileData, language: val })}
                      >
                        <SelectTrigger className="w-full h-12 bg-[#FDF8F3]/50 border-orange-50 rounded-2xl">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-orange-50">
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Time zone</label>
                      <Select 
                        value={profileData.timezone}
                        onValueChange={(val) => setProfileData({ ...profileData, timezone: val })}
                      >
                        <SelectTrigger className="w-full h-12 bg-[#FDF8F3]/50 border-orange-50 rounded-2xl">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-orange-50">
                          <SelectItem value="+1 GMT">+1 GMT</SelectItem>
                          <SelectItem value="GMT">GMT</SelectItem>
                          <SelectItem value="-5 EST">-5 EST</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Currency</label>
                      <Select 
                        value={profileData.currency}
                        onValueChange={(val) => setProfileData({ ...profileData, currency: val })}
                      >
                        <SelectTrigger className="w-full h-12 bg-[#FDF8F3]/50 border-orange-50 rounded-2xl">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-orange-50">
                          <SelectItem value="Naira">Naira (₦)</SelectItem>
                          <SelectItem value="Dollar">Dollar ($)</SelectItem>
                          <SelectItem value="Euro">Euro (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={handleProfileUpdate}
                      disabled={isSaving}
                      className="w-full md:w-fit bg-cartlist-orange hover:bg-orange-600 text-white rounded-full px-10 h-12 font-bold gap-2 shadow-lg shadow-orange-200 mt-4"
                    >
                      {isSaving ? "Saving..." : "Save changes"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notification" className="mt-0">
            <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-bold">Notification preferences</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Manage how you receive notifications for different activities</p>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-8">
                {[
                  { 
                    id: "stockpileUpdates", 
                    title: "Stockpile Updates", 
                    desc: "When items are added or modified in a customer's stockpile." 
                  },
                  { 
                    id: "reminders", 
                    title: "Stockpile Reminders", 
                    desc: "Notifications when a stockpile is nearing its closing date." 
                  },
                  { 
                    id: "customerActivity", 
                    title: "Customer Activity", 
                    desc: "Alerts when customers view their stockpile lists." 
                  },
                  { 
                    id: "systemAlerts", 
                    title: "System Alerts", 
                    desc: "Security alerts and important account updates." 
                  },
                ].map((category) => (
                  <div key={category.id} className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-orange-50 pb-2">
                      <div>
                        <h4 className="font-bold text-gray-900">{category.title}</h4>
                        <p className="text-sm text-muted-foreground">{category.desc}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { id: "email", label: "Email", icon: Mail },
                        { id: "sms", label: "WhatsApp", icon: Phone },
                        { id: "push", label: "Push", icon: Bell },
                        { id: "inApp", label: "In-App", icon: LayoutGrid },
                      ].map((channel) => (
                        <div key={channel.id} className="flex items-center justify-between p-4 rounded-2xl border border-orange-50 bg-orange-50/10">
                          <div className="flex items-center gap-2">
                            <channel.icon className="w-4 h-4 text-cartlist-orange" />
                            <span className="text-sm font-bold text-gray-700">{channel.label}</span>
                          </div>
                          <Switch 
                            checked={notificationSettings[category.id as keyof typeof notificationSettings][channel.id as keyof { email: boolean; sms: boolean; push: boolean; inApp: boolean }]}
                            onCheckedChange={(checked) => {
                              setNotificationSettings({
                                ...notificationSettings,
                                [category.id]: {
                                  ...notificationSettings[category.id as keyof typeof notificationSettings],
                                  [channel.id]: checked
                                }
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="pt-4">
                  <Button 
                    onClick={handleProfileUpdate}
                    disabled={isSaving}
                    className="bg-cartlist-orange hover:bg-orange-600 text-white rounded-full px-10 h-12 font-bold gap-2 shadow-lg shadow-orange-200"
                  >
                    {isSaving ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-0">
            <Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden max-w-3xl">
                <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">Security settings</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Manage your account security settings</p>
                  </div>
                  <Button 
                    onClick={() => {
                      if (isEditingSecurity && securityData.currentPassword && securityData.newPassword && securityData.confirmPassword) {
                        handlePasswordChange({ preventDefault: () => {} } as React.FormEvent);
                      } else {
                        setIsEditingSecurity(!isEditingSecurity);
                      }
                    }}
                    disabled={isSaving}
                    className="rounded-full border-orange-100 gap-2 font-bold text-gray-500 hover:bg-orange-50"
                    variant="outline"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-cartlist-orange border-t-transparent rounded-full animate-spin" />
                    ) : isEditingSecurity && securityData.currentPassword && securityData.newPassword && securityData.confirmPassword ? (
                      <Save className="w-4 h-4" />
                    ) : (
                      <Edit2 className="w-4 h-4" />
                    )}
                    {isEditingSecurity && securityData.currentPassword && securityData.newPassword && securityData.confirmPassword ? "Save" : "Edit"}
                  </Button>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-8">
                  <div className="space-y-6 max-w-md">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Email</label>
                      <Input 
                        value={profileData.email}
                        readOnly
                        className="h-12 bg-gray-50 border-gray-100 rounded-2xl text-gray-400 cursor-not-allowed"
                      />
                    </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-gray-700">Current password</label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[10px] font-bold text-gray-400 uppercase tracking-wider h-auto p-0 hover:bg-transparent hover:text-cartlist-orange"
                        onClick={() => setSecurityData({ ...securityData, currentPassword: "" })}
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="relative">
                      <Input 
                        type={showPasswords.current ? "text" : "password"}
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                        readOnly={!isEditingSecurity}
                        className={`h-12 border-orange-50 rounded-2xl pr-12 focus-visible:ring-cartlist-orange ${!isEditingSecurity ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-[#FDF8F3]/50"}`}
                        placeholder="••••••••••••"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 text-gray-400"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-gray-700">New password</label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[10px] font-bold text-gray-400 uppercase tracking-wider h-auto p-0 hover:bg-transparent hover:text-cartlist-orange"
                        onClick={() => setSecurityData({ ...securityData, newPassword: "" })}
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="relative">
                      <Input 
                        type={showPasswords.new ? "text" : "password"}
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                        readOnly={!isEditingSecurity}
                        className={`h-12 border-orange-50 rounded-2xl pr-12 focus-visible:ring-cartlist-orange ${!isEditingSecurity ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-[#FDF8F3]/50"}`}
                        placeholder="••••••••••••"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 text-gray-400"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-gray-700">Retype New password</label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[10px] font-bold text-gray-400 uppercase tracking-wider h-auto p-0 hover:bg-transparent hover:text-cartlist-orange"
                        onClick={() => setSecurityData({ ...securityData, confirmPassword: "" })}
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="relative">
                      <Input 
                        type={showPasswords.confirm ? "text" : "password"}
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                        readOnly={!isEditingSecurity}
                        className={`h-12 border-orange-50 rounded-2xl pr-12 focus-visible:ring-cartlist-orange ${!isEditingSecurity ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-[#FDF8F3]/50"}`}
                        placeholder="••••••••••••"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 text-gray-400"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
