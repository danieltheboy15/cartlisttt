import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  ArrowRight, 
  Building2, 
  Truck, 
  ShoppingBag, 
  CheckCircle2,
  X,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function WelcomeModal() {
  const { user, fetchWithAuth, checkAuth } = useAuth();
  const [step, setStep] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  // Show only if user has finished onboarding (businessName exists) but hasn't seen welcome
  const show = !!user && !!user.businessName && user.hasSeenWelcome === false;

  const handleClose = async () => {
    setIsClosing(true);
    try {
      await fetchWithAuth("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasSeenWelcome: true }),
      });
      await checkAuth(); // Refresh user data to hide modal
    } catch (err) {
      console.error("Failed to dismiss welcome modal:", err);
    } finally {
      setIsClosing(false);
    }
  };

  const steps = [
    {
      title: "Welcome to the Family!",
      desc: `Hey ${user?.firstName || 'there'}! We're so excited to help you grow ${user?.businessName || 'your business'}. Cartlist is your new secret weapon for managing stockpiles.`,
      icon: Sparkles,
      color: "text-cartlist-orange",
      bgColor: "bg-orange-50",
    },
    {
      title: "Professional Tracking",
      desc: "No more messy notebooks or forgotten orders. Log every purchase, track payments, and manage items all in one place.",
      icon: ShoppingBag,
      color: "text-pink-500",
      bgColor: "bg-pink-50",
    },
    {
      title: "Automatic Notifications",
      desc: "We notify you and your customers as deadlines approach. Keep everyone in the loop without lifting a finger.",
      icon: Zap,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    }
  ];

  const currentStep = steps[step];

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white w-full max-w-lg rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden"
        >
          {/* Progress Indicators */}
          <div className="absolute top-8 left-0 right-0 flex justify-center gap-2 z-10 px-10">
            {steps.map((_, i) => (
              <div 
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === step ? "w-8 bg-cartlist-orange" : "w-4 bg-gray-200"
                }`}
              />
            ))}
          </div>

          <div className="px-8 sm:px-12 pt-16 pb-10 sm:pb-12 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center"
              >
                <div className={`w-20 h-20 sm:w-24 sm:h-24 ${currentStep.bgColor} rounded-[32px] flex items-center justify-center mb-8 rotate-3 shadow-inner`}>
                  <currentStep.icon className={`w-10 h-10 sm:w-12 sm:h-12 ${currentStep.color} -rotate-3`} />
                </div>

                <h2 className="text-2xl sm:text-3xl font-black font-heading mb-4 text-gray-900 leading-tight">
                  {currentStep.title}
                </h2>
                
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-10">
                  {currentStep.desc}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-3">
              {step < steps.length - 1 ? (
                <Button
                  onClick={() => setStep(s => s + 1)}
                  className="w-full h-14 sm:h-16 bg-cartlist-orange hover:bg-orange-600 text-white rounded-full text-lg sm:text-xl font-bold shadow-xl shadow-orange-200 transition-all flex items-center justify-center gap-2"
                >
                  Next <ArrowRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  onClick={handleClose}
                  disabled={isClosing}
                  className="w-full h-14 sm:h-16 bg-cartlist-orange hover:bg-orange-600 text-white rounded-full text-lg sm:text-xl font-bold shadow-xl shadow-orange-200 transition-all flex items-center justify-center gap-2"
                >
                  {isClosing ? "Setting up..." : "Let's Get Started!"}
                  {!isClosing && <CheckCircle2 className="w-5 h-5" /> }
                </Button>
              )}
            </div>
            
            <p className="mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Join 1,000+ businesses growing on Cartlist
            </p>
          </div>

          {/* Decorative Corner */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cartlist-orange/5 rounded-full blur-3xl invisible sm:visible" />
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-cartlist-orange/5 rounded-full blur-3xl invisible sm:visible" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
