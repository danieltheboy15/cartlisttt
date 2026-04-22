import { motion } from "motion/react";
import { 
  Box, 
  Brain, 
  Globe, 
  Instagram, 
  Linkedin, 
  Facebook, 
  Twitter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const Logo = ({ className = "" }: { className?: string }) => {
  const { user } = useAuth();
  return (
    <Link to={user ? "/dashboard" : "/"} className={`flex items-center gap-3 ${className}`}>
      <img 
        src="https://raw.githubusercontent.com/DannyYo696/svillage/cfdfd8520f96d8d336b2d00597bb7e5bde1cde14/cl%20logo.png" 
        alt="Cartlist Logo" 
        className="h-10 w-auto object-contain"
        referrerPolicy="no-referrer"
      />
    </Link>
  );
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-8 rounded-3xl border border-orange-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden"
  >
    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-6 z-10">
      <Icon className="text-white w-6 h-6" />
    </div>
    <h3 className="text-2xl font-bold mb-4 font-heading">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
    <div className="absolute top-0 left-0 w-full h-1 bg-orange-50 opacity-0 hover:opacity-100 transition-opacity" />
  </motion.div>
);

export default function Landing() {
  return (
    <div className="min-h-screen selection:bg-orange-100 selection:text-cartlist-orange">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-orange-50">
  <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-center">
    
    {/* Left links (optional) */}
   

    {/* Centered Logo */}
    <Logo />

  </div>
</nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 -z-10" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 mb-8">
              <span className="text-5xl md:text-7xl font-bold tracking-tight">Welcome to</span>
              <div className="relative inline-block px-8 py-2">
                <div className="absolute inset-0 border-2 border-cartlist-orange rounded-full -rotate-2" />
                <span className="text-5xl md:text-7xl font-bold text-cartlist-orange">Cartlist</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-8 font-heading">
              Track your stockpile orders, stay organized, and manage everything in one place.
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              No more missed or lost stockpile orders. No more confusion.
            </p>

            {/* Avatar Stack */}
            <div className="flex flex-col items-center gap-4 mb-12">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <img
                    key={i}
                    src={`https://picsum.photos/seed/user${i}/100/100`}
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-background object-cover"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
              <p className="text-sm font-medium">Be the first to try <span className="font-bold">CARTLIST</span></p>
            </div>

            {/* Waitlist Form */}
            <div className="max-w-md mx-auto flex flex-col gap-4">
              <div className="relative">
                <Input 
                  placeholder="Enter your email" 
                  className="h-14 rounded-full px-8 border-orange-100 focus:ring-cartlist-orange bg-white/50 backdrop-blur-sm"
                />
              </div>
              <Button className="h-14 rounded-full bg-cartlist-orange hover:bg-orange-600 text-white text-lg font-semibold shadow-lg shadow-orange-200 transition-all hover:scale-105">
                Get early access
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Brain}
              title="Smart Automation"
              description="Keep all your orders in one place automatically with our AI-powered tracking system."
            />
            <FeatureCard 
              icon={Box}
              title="Manage Stockpile"
              description="Stay on top of all your stockpile orders with real-time inventory updates and alerts."
            />
            <FeatureCard 
              icon={Globe}
              title="Multiple platform"
              description="Works with how you already sell. Seamlessly integrate with Shopify, Amazon, and more."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative pt-40 pb-20 overflow-hidden bg-background">
        {/* Large Watermark */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none opacity-[0.03]">
          <span className="text-[20vw] font-[#f07e48] tracking-tighter leading-none">CARTLIST</span>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2">
              <Logo className="mb-6" />
              <p className="text-muted-foreground max-w-xs">
                No more missed or lost stockpile orders. No more confusion.
              </p>
            </div>
            
            

            <div>
              <h4 className="font-bold mb-6 font-heading">Socials</h4>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/usecartlist/" className="w-10 h-10 rounded-lg border border-orange-100 flex items-center justify-center hover:bg-orange-50 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://www.linkedin.com/company/cart-list/" className="w-10 h-10 rounded-lg border border-orange-100 flex items-center justify-center hover:bg-orange-50 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="https://www.facebook.com/share/17YTivYRT2/?mibextid=wwXIfr" className="w-10 h-10 rounded-lg border border-orange-100 flex items-center justify-center hover:bg-orange-50 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://x.com/usecartlist" className="w-10 h-10 rounded-lg border border-orange-100 flex items-center justify-center hover:bg-orange-50 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-orange-100 flex flex-col md:row-reverse md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2026 Cartlist stockpile solution</p>
            
          </div>
        </div>
      </footer>
    </div>
  );
}
