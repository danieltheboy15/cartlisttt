import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";
import crypto from "crypto";
import axios from "axios";
import { format } from "date-fns";

dotenv.config();

const app = express();
const PORT = 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// Lazy initialize Resend to avoid crashing if API key is missing
let resendClient: Resend | null = null;
const getResend = () => {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

const sendVerificationEmail = async (email: string, firstName: string, verificationToken: string, req: any) => {
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.get("host");
  const verificationLink = `${protocol}://${host}/api/auth/verify-email?token=${verificationToken}`;

  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not found. Verification email not sent.");
    console.log("Verification link:", verificationLink);
    return false;
  }

  try {
    await resend.emails.send({
      from: "Cartlist <onboarding@buynightflix.com>",
      to: email,
      subject: "Verify your Cartlist account",
      html: `
        <div style="font-family: 'Inter', sans-serif; background-color: #FDF8F3; padding: 40px; border-radius: 24px; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
          <div style="text-align: center; margin-bottom: 32px;">
            <img src="https://raw.githubusercontent.com/DannyYo696/svillage/cfdfd8520f96d8d336b2d00597bb7e5bde1cde14/cl%20logo.png" alt="Cartlist Logo" style="height: 48px;">
          </div>
          <div style="background-color: #FFFFFF; padding: 40px; border-radius: 32px; box-shadow: 0 4px 20px rgba(240, 126, 72, 0.05);">
            <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 16px; color: #1A1A1A;">Verify your email address</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #6B7280; margin-bottom: 32px;">
              Hello ${firstName}, welcome to Cartlist! We're excited to have you on board. Please verify your email address to start managing your stockpiles.
            </p>
            <div style="text-align: center;">
              <a href="${verificationLink}" style="background-color: #F07E48; color: #FFFFFF; padding: 16px 40px; border-radius: 100px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(240, 126, 72, 0.2);">
                Verify Email
              </a>
            </div>
            <p style="font-size: 14px; color: #9CA3AF; margin-top: 32px; text-align: center;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
          <div style="text-align: center; margin-top: 24px; color: #9CA3AF; font-size: 12px;">
            &copy; 2026 Cartlist. All rights reserved.
          </div>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

const sendWelcomeEmail = async (email: string, firstName: string) => {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not found. Welcome email not sent.");
    return false;
  }

  try {
    await resend.emails.send({
      from: "Cartlist <onboarding@buynightflix.com>",
      to: email,
      subject: "Welcome to Cartlist! 🚀",
      html: `
        <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #FDF8F3; padding: 40px; color: #1A1A1A;">
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 32px;">
              <img src="https://raw.githubusercontent.com/DannyYo696/svillage/cfdfd8520f96d8d336b2d00597bb7e5bde1cde14/cl%20logo.png" alt="Cartlist Logo" style="height: 48px;">
            </div>
            
            <div style="background-color: #FFFFFF; padding: 48px; border-radius: 32px; box-shadow: 0 10px 30px rgba(240, 126, 72, 0.08);">
              <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 24px; color: #1A1A1A; line-height: 1.2;">Welcome to the family, ${firstName}! 🎉</h1>
              
              <p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin-bottom: 24px;">
                We're thrilled to have you join Cartlist. You've just taken the first step towards professional stockpile management. No more lost orders, no more confusion—just pure organization.
              </p>
              
              <div style="background-color: #FFF7F2; border-radius: 24px; padding: 32px; margin-bottom: 32px; border: 1px solid #FFE4D6;">
                <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #F07E48;">Quick Start Guide:</h2>
                <ul style="padding-left: 0; list-style-type: none; margin: 0;">
                  <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                    <span style="color: #F07E48; margin-right: 12px; font-weight: bold;">01.</span>
                    <span style="color: #4B5563;"><strong>Log your first purchase:</strong> Head to the "Log Purchase" section to start tracking a customer's stockpile.</span>
                  </li>
                  <li style="margin-bottom: 12px; display: flex; align-items: flex-start;">
                    <span style="color: #F07E48; margin-right: 12px; font-weight: bold;">02.</span>
                    <span style="color: #4B5563;"><strong>Set deadlines:</strong> Each stockpile has an end date. We'll notify you (and your customers) as the date approaches.</span>
                  </li>
                  <li style="margin-bottom: 0; display: flex; align-items: flex-start;">
                    <span style="color: #F07E48; margin-right: 12px; font-weight: bold;">03.</span>
                    <span style="color: #4B5563;"><strong>Manage with ease:</strong> Use your dashboard to see total earnings, active clients, and items closing soon.</span>
                  </li>
                </ul>
              </div>
              
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="https://cartlist-production.up.railway.app//dashboard" style="background-color: #F07E48; color: #FFFFFF; padding: 18px 48px; border-radius: 100px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(240, 126, 72, 0.25);">
                  Go to my Dashboard
                </a>
              </div>
              
              <p style="font-size: 14px; line-height: 1.6; color: #9CA3AF; text-align: center;">
                Need help? Just reply to this email or reach out to our support team. We're here to help you grow your business!
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 32px;">
              <div style="margin-bottom: 16px;">
                <a href="#" style="margin: 0 10px; text-decoration: none; color: #9CA3AF;">Instagram</a>
                <a href="#" style="margin: 0 10px; text-decoration: none; color: #9CA3AF;">Twitter</a>
                <a href="#" style="margin: 0 10px; text-decoration: none; color: #9CA3AF;">LinkedIn</a>
              </div>
              <p style="color: #9CA3AF; font-size: 12px;">
                &copy; 2026 Cartlist Stockpile Solutions. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
};

const sendWhatsAppNotification = async (to: string, message: string) => {
  const apiKey = process.env.KAPSO_API_KEY;
  const senderId = process.env.KAPSO_SENDER_ID;

  if (!apiKey || !senderId) {
    console.warn("KAPSO_API_KEY or KAPSO_SENDER_ID not found. WhatsApp notification not sent.");
    console.log("Simulated WhatsApp to", to, ":", message);
    return false;
  }

  // Format phone number to international format with plus (e.g., +23480...)
  let formattedTo = to.replace(/\D/g, "");
  if (formattedTo.startsWith("0") && formattedTo.length === 11) {
    formattedTo = "+234" + formattedTo.substring(1);
  } else if (formattedTo.length === 10) {
    formattedTo = "+234" + formattedTo;
  } else if (!formattedTo.startsWith("+") && (formattedTo.startsWith("234"))) {
    formattedTo = "+" + formattedTo;
  } else if (!formattedTo.startsWith("+")) {
    // Fallback for other formats, ensure it has a +
    formattedTo = "+" + formattedTo;
  }

  // List of potential endpoints and their respective payload structures
  const attempts = [
    { 
      url: "https://api.kapso.ai/v1/whatsapp/send", 
      data: { recipient: formattedTo, message, sender: senderId } 
    },
    { 
      url: "https://api.kapso.ai/v1/whatsapp/send", 
      data: { to: formattedTo, message, sender: senderId } 
    },
    { 
      url: "https://api.kapso.ai/v1/whatsapp/send", 
      data: { phone: formattedTo, message, sender: senderId } 
    },
    { 
      url: "https://api.kapso.ai/v1/whatsapp/send", 
      data: { recipient: formattedTo, message, from: senderId } 
    },
    { 
      url: "https://api.kapso.ai/v1/messages", 
      data: { recipient: formattedTo, message, sender: senderId } 
    },
    { 
      url: "https://api.kapso.ai/v1/whatsapp/messages", 
      data: { recipient: formattedTo, message, sender: senderId } 
    },
    { 
      url: "https://api.kapso.ai/v1/whatsapp/send-message", 
      data: { recipient: formattedTo, message, sender: senderId } 
    },
    { 
      url: "https://api.kapso.ai/v1/whatsapp/single", 
      data: { recipient: formattedTo, message, sender: senderId } 
    },
    { 
      url: "https://api.kapso.ai/v1/whatsapp/send", 
      data: { recipient: formattedTo, text: message, sender: senderId } 
    },
    { 
      url: "https://api.kapso.ai/v1/whatsapp/send", 
      data: { recipient: formattedTo, body: message, sender: senderId } 
    },
    { 
      url: "https://api.kapso.ai/v1/whatsapp/send", 
      data: { recipient: formattedTo, message, sender: senderId },
      headers: { "api-key": apiKey }
    },
    { 
      url: "https://api.kapso.ai/v1/whatsapp/send", 
      data: { recipient: formattedTo, message, sender: senderId },
      headers: { "x-api-key": apiKey }
    }
  ];

  for (const attempt of attempts) {
    try {
      const headers: any = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...attempt.headers
      };

      // Add Bearer token if not already provided in custom headers
      if (!headers["api-key"] && !headers["x-api-key"]) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const response = await axios.post(attempt.url, attempt.data, {
        headers,
        timeout: 10000
      });
      console.log(`WhatsApp notification sent successfully via ${attempt.url}`);
      return true;
    } catch (error: any) {
      const status = error.response?.status;
      const data = error.response?.data;
      console.error(`Attempt failed for ${attempt.url}:`, status, JSON.stringify(data || error.message));
      
      if (status === 401) {
        console.error("Kapso API Key is invalid (401 Unauthorized)");
        break;
      }
    }
  }

  return false;
};

// Helper to send stockpile update WhatsApp notification
const sendStockpileUpdateNotification = async (vendor: any, stockpile: any, itemsAdded: any[]) => {
  try {
    const prefs = vendor.notifications?.stockpileUpdates || { email: true, sms: true, push: true, inApp: true };
    
    const itemsList = itemsAdded.map((item: any) => 
      `• ${item.name} x${item.quantity} - ₦${(item.price * item.quantity).toLocaleString()}`
    ).join("\n");

    const closingDate = format(new Date(stockpile.endDate), "d MMMM yyyy");
    const appUrl = process.env.APP_URL || "";
    const publicUrl = `${appUrl}/view/${stockpile._id}`;

    // Send WhatsApp if enabled
    if (prefs.sms !== false) {
      const whatsappMessage = `Hi ${stockpile.customerName}! 🛍️
${vendor.businessName} has updated your stockpile list.

Items added:
${itemsList}

Your current stockpile total: ₦${stockpile.totalAmount.toLocaleString()}
Your stockpile closes on: ${closingDate}

View your full list here 👉 ${publicUrl}

Questions? Contact ${vendor.businessName} on WhatsApp.`;

      await sendWhatsAppNotification(stockpile.customerPhone, whatsappMessage);
    }

    // Send Email if enabled
    if (prefs.email !== false && stockpile.customerEmail) {
      const resend = getResend();
      if (resend) {
        await resend.emails.send({
          from: "Cartlist <onboarding@buynightflix.com>",
          to: stockpile.customerEmail,
          subject: `Stockpile Update from ${vendor.businessName}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2>Hi ${stockpile.customerName}!</h2>
              <p><strong>${vendor.businessName}</strong> has updated your stockpile list.</p>
              <p><strong>Items added:</strong></p>
              <pre>${itemsList}</pre>
              <p><strong>Current Total:</strong> ₦${stockpile.totalAmount.toLocaleString()}</p>
              <p><strong>Closing Date:</strong> ${closingDate}</p>
              <p><a href="${publicUrl}" style="display: inline-block; padding: 10px 20px; background-color: #F07E48; color: white; text-decoration: none; border-radius: 5px;">View Full List</a></p>
            </div>
          `
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Error preparing notifications:", error);
    return false;
  }
};

const sendStockpileExtensionNotification = async (vendor: any, stockpile: any) => {
  try {
    const prefs = vendor.notifications?.stockpileUpdates || { email: true, sms: true, push: true, inApp: true };
    const closingDate = format(new Date(stockpile.endDate), "d MMMM yyyy");
    const appUrl = process.env.APP_URL || "";
    const publicUrl = `${appUrl}/view/${stockpile._id}`;

    // Send WhatsApp if enabled
    if (prefs.sms !== false) {
      const whatsappMessage = `Hi ${stockpile.customerName}! 📅
${vendor.businessName} has updated the closing date for your stockpile.

New closing date: ${closingDate}

View your full list and status here 👉 ${publicUrl}

Thank you for choosing ${vendor.businessName}!`;

      await sendWhatsAppNotification(stockpile.customerPhone, whatsappMessage);
    }

    // Send Email if enabled
    if (prefs.email !== false && stockpile.customerEmail) {
      const resend = getResend();
      if (resend) {
        await resend.emails.send({
          from: "Cartlist <onboarding@buynightflix.com>",
          to: stockpile.customerEmail,
          subject: `${vendor.businessName} has extended your stockpile deadline`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2>Hi ${stockpile.customerName}!</h2>
              <p><strong>${vendor.businessName}</strong> has updated the closing date for your stockpile.</p>
              <p><strong>New Closing Date:</strong> ${closingDate}</p>
              <p><a href="${publicUrl}" style="display: inline-block; padding: 10px 20px; background-color: #F07E48; color: white; text-decoration: none; border-radius: 5px;">View Detailed Status</a></p>
              <p>Thank you for your business!</p>
            </div>
          `
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Error sending extension notification:", error);
    return false;
  }
};

// Trust proxy is required for secure cookies behind a proxy (Cloud Run/AI Studio)
app.set("trust proxy", 1);

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Authentication Middleware
const authenticate = async (req: any, res: any, next: any) => {
  try {
    let token = req.cookies.token;
    
    // Fallback to Authorization header if cookie is missing (common in iframes)
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// MongoDB Connection
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.error("MongoDB connection error:", err));
} else {
  console.warn("MONGODB_URI not found in environment variables. Database features will not work.");
}

// User Schema
const userSchema = new mongoose.Schema({
  businessName: { type: String },
  ownerName: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  googleId: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  whatsappNumber: { type: String },
  password: { type: String },
  gender: { type: String },
  profilePicture: { type: String, default: "https://raw.githubusercontent.com/DannyYo696/svillage/29b4c24e6ca88b3ecf3856f30fceb3f29eef40bf/profile%20picture.webp" }, // Custom default avatar
  businessCategory: { type: String },
  language: { type: String, default: "English" },
  timezone: { type: String, default: "+1 GMT" },
  currency: { type: String, default: "Naira" },
  notifications: {
    stockpileUpdates: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    reminders: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    customerActivity: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    systemAlerts: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    }
  },
  resetPasswordOTP: { type: String },
  resetPasswordExpires: { type: Date },
  resetPasswordAttempts: [{ type: Date }],
  hasSeenWelcome: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

// Stockpile Schema
const stockpileSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String },
  endDate: { type: Date, required: true },
  deliveryPaid: { type: Boolean, default: false },
  deliveryDue: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "closed"], default: "active" },
  sentMilestones: { type: [String], default: [] }, // ['5days', '2days', 'today']
  items: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    addedAt: { type: Date, default: Date.now }
  }],
  totalAmount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const Stockpile = mongoose.model("Stockpile", stockpileSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["info", "warning", "urgent"], default: "info" },
  isRead: { type: Boolean, default: false },
  stockpileId: { type: mongoose.Schema.Types.ObjectId, ref: "Stockpile" },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model("Notification", notificationSchema);

// Customer Schema
const customerSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  note: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

customerSchema.index({ vendorId: 1, phone: 1 }, { unique: true });
const Customer = mongoose.model("Customer", customerSchema);

// Public Stockpile View Route
app.get("/api/public/stockpiles/:id", async (req, res) => {
  try {
    const stockpile = await Stockpile.findById(req.params.id);
    if (!stockpile) return res.status(404).json({ message: "Stockpile not found" });

    const vendor = await User.findById(stockpile.vendorId).select("businessName ownerName whatsappNumber profilePicture notifications");
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    // Notify vendor of activity if enabled
    const prefs = vendor.notifications?.customerActivity || { email: true, sms: false, push: true, inApp: true };
    
    if (prefs.inApp !== false) {
      await Notification.create({
        userId: vendor._id,
        title: "Stockpile Viewed",
        message: `${stockpile.customerName} just viewed their stockpile list.`,
        type: "info",
        stockpileId: stockpile._id
      });
    }

    // You could also send email/push here if enabled in prefs

    res.json({ ...stockpile.toObject(), vendorId: vendor });
  } catch (error) {
    console.error("Fetch public stockpile error:", error);
    res.status(500).json({ message: "Error fetching stockpile" });
  }
});

app.post("/api/stockpiles/:id/remind", authenticate, async (req: any, res) => {
  try {
    const vendorId = req.userId;
    const stockpile = await Stockpile.findOne({ _id: req.params.id, vendorId, isDeleted: { $ne: true } });
    if (!stockpile) return res.status(404).json({ message: "Stockpile not found" });

    const vendor = await User.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const prefs = vendor.notifications?.reminders || { email: true, sms: true, push: true, inApp: true };
    
    const closingDate = format(new Date(stockpile.endDate), "d MMMM yyyy");
    const appUrl = process.env.APP_URL || "";
    const publicUrl = `${appUrl}/view/${stockpile._id}`;

    // Send WhatsApp if enabled
    if (prefs.sms !== false) {
      const whatsappMessage = `Hi ${stockpile.customerName}! 🛍️
Just a friendly reminder from ${vendor.businessName} that your stockpile list is closing on ${closingDate}.

Current Total: ₦${stockpile.totalAmount.toLocaleString()}
View your list here 👉 ${publicUrl}

Don't forget to finalize your orders!`;

      await sendWhatsAppNotification(stockpile.customerPhone, whatsappMessage);
    }

    // Send Email if enabled
    if (prefs.email !== false && stockpile.customerEmail) {
      const resend = getResend();
      if (resend) {
        await resend.emails.send({
          from: "Cartlist <onboarding@buynightflix.com>",
          to: stockpile.customerEmail,
          subject: `Reminder: Your Stockpile with ${vendor.businessName}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2>Hi ${stockpile.customerName}!</h2>
              <p>This is a friendly reminder from <strong>${vendor.businessName}</strong>.</p>
              <p>Your stockpile list is closing on <strong>${closingDate}</strong>.</p>
              <p><strong>Current Total:</strong> ₦${stockpile.totalAmount.toLocaleString()}</p>
              <p><a href="${publicUrl}" style="display: inline-block; padding: 10px 20px; background-color: #F07E48; color: white; text-decoration: none; border-radius: 5px;">View Your List</a></p>
              <p>Don't forget to finalize your orders before the closing date!</p>
            </div>
          `
        });
      }
    }

    res.json({ message: "Reminder sent successfully" });
  } catch (error) {
    console.error("Error sending reminder:", error);
    res.status(500).json({ message: "Error sending reminder" });
  }
});

// Auth Routes
app.get("/api/auth/google/url", (req, res) => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: `${process.env.APP_URL}/api/auth/google/callback`,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const qs = new URLSearchParams(options);
  res.json({ url: `${rootUrl}?${qs.toString()}` });
});

app.get("/api/auth/google/callback", async (req, res) => {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).send("No code provided");
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.APP_URL}/api/auth/google/callback`,
      grant_type: "authorization_code",
    });

    const { access_token, id_token } = tokenResponse.data;

    // Get user info from Google
    const googleUserResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );

    const googleUser = googleUserResponse.data;

    // Find or create user
    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      // Create new user
      user = new User({
        email: googleUser.email,
        ownerName: googleUser.name,
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
        googleId: googleUser.id,
        isEmailVerified: true, // Google emails are verified
        profilePicture: googleUser.picture || "https://raw.githubusercontent.com/DannyYo696/svillage/29b4c24e6ca88b3ecf3856f30fceb3f29eef40bf/profile%20picture.webp",
      });
      await user.save();
      
      // Send welcome email for new Google users
      await sendWelcomeEmail(user.email, user.firstName || user.ownerName.split(" ")[0]);
    } else if (!user.googleId) {
      // Link Google account to existing email account
      user.googleId = googleUser.id;
      user.isEmailVerified = true;
      if (!user.profilePicture || user.profilePicture.includes("profile%20picture.webp")) {
        user.profilePicture = googleUser.picture;
      }
      await user.save();
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "30d" });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      partitioned: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Send success message and close popup
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS', 
                token: '${token}',
                user: ${JSON.stringify({
                  id: user._id,
                  businessName: user.businessName,
                  ownerName: user.ownerName,
                  email: user.email,
                  profilePicture: user.profilePicture
                })}
              }, '*');
              window.close();
            } else {
              window.location.href = '/dashboard';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error("Google OAuth error:", error.response?.data || error.message);
    res.status(500).send("Authentication failed");
  }
});
// ... (existing auth routes)

// Dashboard Data Route
app.get("/api/user/profile", authenticate, async (req: any, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

app.patch("/api/user/profile", authenticate, async (req: any, res) => {
  try {
    const updates = req.body;
    // Don't allow password updates here
    delete updates.password;
    
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
});

app.post("/api/user/change-password", authenticate, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error changing password" });
  }
});

// Notification Routes
app.get("/api/notifications", authenticate, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    
    // Check for new notifications based on stockpile dates
    const activeStockpiles = await Stockpile.find({ vendorId: userId, status: "active" });
    const now = new Date();
    
    for (const stockpile of activeStockpiles) {
      const endDate = new Date(stockpile.endDate);
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let milestone = "";
      let title = "";
      let message = "";
      let type: "info" | "warning" | "urgent" = "info";
      
      if (diffDays === 5) {
        milestone = "5days";
        title = "Stockpile Closing Soon";
        message = `${stockpile.customerName}'s stockpile will close in 5 days.`;
        type = "info";
      } else if (diffDays === 2) {
        milestone = "2days";
        title = "Stockpile Closing in 2 Days";
        message = `${stockpile.customerName}'s stockpile will close in 2 days. Please notify the customer.`;
        type = "warning";
      } else if (diffDays <= 0) {
        milestone = "today";
        title = "Stockpile Closing Today";
        message = `${stockpile.customerName}'s stockpile closes today.`;
        type = "urgent";
      }
      
      if (milestone && !stockpile.sentMilestones.includes(milestone)) {
        await Notification.create({
          userId,
          title,
          message,
          type,
          stockpileId: stockpile._id
        });
        
        stockpile.sentMilestones.push(milestone);
        await stockpile.save();
      }
    }
    
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

app.patch("/api/notifications/:id/read", authenticate, async (req: any, res: any) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Error updating notification" });
  }
});

app.post("/api/notifications/read-all", authenticate, async (req: any, res: any) => {
  try {
    await Notification.updateMany({ userId: req.userId, isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notifications" });
  }
});

app.get("/api/dashboard/stats", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const { period, startDate, endDate } = req.query;

    let dateFilter = {};
    const now = new Date();
    
    if (period === "today") {
      const startOfToday = new Date(now.setHours(0, 0, 0, 0));
      dateFilter = { createdAt: { $gte: startOfToday } };
    } else if (period === "7days") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: sevenDaysAgo } };
    } else if (period === "thisMonth") {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { createdAt: { $gte: firstDayOfMonth } };
    } else if (period === "allTime") {
      dateFilter = {};
    } else if (period === "custom" && startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        }
      };
    }

    // Fetch all non-deleted stockpiles to include closed ones in total value as requested
    const allStockpiles = await Stockpile.find({ vendorId, isDeleted: { $ne: true } });
    
    // Filter by date if needed (for the selected period)
    const filteredStockpiles = dateFilter.hasOwnProperty('createdAt') 
      ? allStockpiles.filter(s => {
          const filter = dateFilter as any;
          const createdAt = new Date(s.createdAt);
          if (filter.createdAt.$lte) {
            return createdAt >= filter.createdAt.$gte && createdAt <= filter.createdAt.$lte;
          }
          return createdAt >= filter.createdAt.$gte;
        })
      : allStockpiles;

    // We still need active ones for specific stats like 'closing soon'
    const activeStockpiles = filteredStockpiles.filter(s => s.status === "active");
    const allActiveStockpiles = allStockpiles.filter(s => s.status === "active");

    const stats = {
      // Calculate total value by summing all items in ALL stockpiles (active + closed)
      // The user wants to see every amount of stockpiled orders regardless of whether they are open or closed
      totalValue: filteredStockpiles.reduce((sum, s) => {
        const stockpileTotal = s.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
        return sum + stockpileTotal;
      }, 0),
      // Active clients are those with currently active stockpiles
      activeClients: new Set(activeStockpiles.map(s => s.customerPhone)).size,
      // Total orders includes both active and closed stockpiles
      totalOrders: filteredStockpiles.length,
      // Unpaid deliveries should include all stockpiles that are not paid
      unpaidDeliveries: allStockpiles.filter(s => !s.deliveryPaid).length,
      closingSoon: activeStockpiles.filter(s => {
        const diff = new Date(s.endDate).getTime() - new Date().getTime();
        return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
      }).length,
      logsToday: allStockpiles.reduce((sum, s) => {
        const today = new Date().setHours(0, 0, 0, 0);
        return sum + s.items.filter(item => new Date(item.addedAt).getTime() >= today).length;
      }, 0)
    };

    const recentPurchases = await Stockpile.find({ vendorId, isDeleted: { $ne: true } })
      .sort({ updatedAt: -1 })
      .limit(5);

    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const closingSoonList = await Stockpile.find({ 
      vendorId, 
      status: "active",
      endDate: { $gt: now, $lte: sevenDaysFromNow }
    })
      .sort({ endDate: 1 })
      .limit(5);

    res.json({ stats, recentPurchases, closingSoonList });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
});

// Customer Search Route
app.get("/api/customers/search", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const { q } = req.query;

    if (!q) return res.json([]);

    const customers = await Stockpile.aggregate([
      { $match: { vendorId } },
      {
        $match: {
          $or: [
            { customerName: { $regex: q, $options: "i" } },
            { customerPhone: { $regex: q, $options: "i" } }
          ]
        }
      },
      {
        $group: {
          _id: "$customerPhone",
          name: { $first: "$customerName" },
          phone: { $first: "$customerPhone" },
          email: { $first: "$customerEmail" }
        }
      },
      { $limit: 10 }
    ]);

    res.json(customers);
  } catch (error) {
    console.error("Search customers error:", error);
    res.status(500).json({ message: "Error searching customers" });
  }
});

app.get("/api/customers/:phone", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const { phone } = req.params;

    // Get or create customer record for notes
    let customer = await Customer.findOne({ vendorId, phone });
    
    // Get all stockpiles for this customer
    const stockpiles = await Stockpile.find({ vendorId, customerPhone: phone }).sort({ createdAt: -1 });
    
    if (stockpiles.length === 0 && !customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // If customer record doesn't exist but stockpiles do, create it
    if (!customer && stockpiles.length > 0) {
      customer = new Customer({
        vendorId,
        name: stockpiles[0].customerName,
        phone: stockpiles[0].customerPhone,
        email: stockpiles[0].customerEmail
      });
      await customer.save();
    }

    // Calculate stats
    const totalAmountPurchased = stockpiles.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalNotPaid = stockpiles.filter(s => !s.deliveryPaid).reduce((sum, s) => sum + s.totalAmount, 0);
    
    // Time spent in stockpile (average duration of active stockpiles)
    const activeStockpiles = stockpiles.filter(s => s.status === "active");
    let avgTimeSpent = 0;
    if (activeStockpiles.length > 0) {
      const totalDays = activeStockpiles.reduce((sum, s) => {
        const start = new Date(s.createdAt).getTime();
        const now = new Date().getTime();
        return sum + Math.ceil((now - start) / (1000 * 60 * 60 * 24));
      }, 0);
      avgTimeSpent = Math.ceil(totalDays / activeStockpiles.length);
    }

    // Average amount of item
    let avgItemPrice = 0;
    const allItems = stockpiles.flatMap(s => s.items);
    if (allItems.length > 0) {
      avgItemPrice = Math.round(totalAmountPurchased / allItems.length);
    }

    const history = stockpiles.flatMap(s => 
      s.items.map(item => ({
        _id: s._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        date: item.addedAt,
        status: s.status === "closed" ? "Delivered" : "Pending",
        isDelivered: s.status === "closed"
      }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({
      customer: {
        name: customer?.name || stockpiles[0].customerName,
        phone: customer?.phone || stockpiles[0].customerPhone,
        email: customer?.email || stockpiles[0].customerEmail,
        note: customer?.note || "",
        hasActiveStockpile: activeStockpiles.length > 0,
        deliveryPaid: activeStockpiles.length > 0 ? activeStockpiles[0].deliveryPaid : false
      },
      stats: {
        totalAmountPurchased,
        totalNotPaid,
        avgTimeSpent,
        avgItemPrice
      },
      history
    });
  } catch (error) {
    console.error("Fetch customer details error:", error);
    res.status(500).json({ message: "Error fetching customer details" });
  }
});

app.patch("/api/customers/:phone/note", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const { phone } = req.params;
    const { note } = req.body;

    const customer = await Customer.findOneAndUpdate(
      { vendorId, phone },
      { note },
      { new: true, upsert: true }
    );

    res.json(customer);
  } catch (error) {
    console.error("Update customer note error:", error);
    res.status(500).json({ message: "Error updating customer note" });
  }
});

app.delete("/api/customers/:phone", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const { phone } = req.params;

    await Stockpile.deleteMany({ vendorId, customerPhone: phone });
    await Customer.deleteOne({ vendorId, phone });

    res.json({ message: "Customer and all their records deleted successfully" });
  } catch (error) {
    console.error("Delete customer error:", error);
    res.status(500).json({ message: "Error deleting customer" });
  }
});

// Stockpile Management Routes
app.get("/api/stockpiles", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const { status, search, filter } = req.query;

    let query: any = { vendorId, isDeleted: { $ne: true } };
    if (status && status !== "all") {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } }
      ];
    }

    const now = new Date();
    if (filter === "today") {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      query.createdAt = { $gte: startOfDay };
    } else if (filter === "thisMonth") {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      query.createdAt = { $gte: firstDayOfMonth };
    }

    let sort: any = { updatedAt: -1 };
    if (filter === "oldest") {
      sort = { createdAt: 1 };
    } else if (filter === "newest") {
      sort = { updatedAt: -1 };
    } else if (filter === "closingSoon") {
      sort = { endDate: 1 };
    }

    const stockpiles = await Stockpile.find(query).sort(sort);
    res.json(stockpiles);
  } catch (error) {
    console.error("Fetch stockpiles error:", error);
    res.status(500).json({ message: "Error fetching stockpiles" });
  }
});

app.get("/api/stockpiles/stats", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    
    // Fetch all non-deleted stockpiles for total stats
    const allStockpiles = await Stockpile.find({ vendorId, isDeleted: { $ne: true } });
    // Filter for active stockpiles for specific counts
    const activeStockpiles = allStockpiles.filter(s => s.status === "active");
    
    const stats = {
      totalEarnings: allStockpiles.reduce((sum, s) => sum + s.totalAmount, 0),
      paidAmount: allStockpiles.filter(s => s.deliveryPaid).reduce((sum, s) => sum + s.totalAmount, 0),
      notPaidAmount: allStockpiles.filter(s => !s.deliveryPaid).reduce((sum, s) => sum + s.totalAmount, 0),
      totalStockpileCount: allStockpiles.length,
      openStockpileCount: activeStockpiles.length,
      closedStockpileCount: allStockpiles.filter(s => s.status === "closed").length,
      deliveryPaidCount: allStockpiles.filter(s => s.deliveryPaid).length,
      deliveryUnpaidCount: allStockpiles.filter(s => !s.deliveryPaid).length,
    };

    res.json(stats);
  } catch (error) {
    console.error("Fetch stockpile stats error:", error);
    res.status(500).json({ message: "Error fetching stockpile stats" });
  }
});

app.get("/api/customers", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    
    const customers = await Stockpile.aggregate([
      { $match: { vendorId } },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: "$customerPhone",
          customerName: { $first: "$customerName" },
          customerEmail: { $first: "$customerEmail" },
          totalSpend: { $sum: "$totalAmount" },
          totalItems: { $sum: { $size: "$items" } },
          lastPurchaseDate: { $max: "$updatedAt" },
          firstPurchaseDate: { $min: "$createdAt" },
          activeStockpiles: {
            $sum: { 
              $cond: [
                { $and: [{ $eq: ["$status", "active"] }, { $ne: ["$isDeleted", true] }] }, 
                1, 
                0
              ] 
            }
          },
          unpaidDeliveries: {
            $sum: { 
              $cond: [
                { $and: [{ $eq: ["$deliveryPaid", false] }, { $ne: ["$isDeleted", true] }] }, 
                1, 
                0
              ] 
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          phone: "$_id",
          name: "$customerName",
          email: "$customerEmail",
          totalSpend: 1,
          totalItems: 1,
          lastPurchaseDate: 1,
          firstPurchaseDate: 1,
          status: { $cond: [{ $gt: ["$activeStockpiles", 0] }, "active", "inactive"] },
          hasUnpaidDelivery: { $gt: ["$unpaidDeliveries", 0] }
        }
      },
      { $sort: { lastPurchaseDate: -1 } }
    ]);

    res.json(customers);
  } catch (error) {
    console.error("Fetch customers error:", error);
    res.status(500).json({ message: "Error fetching customers" });
  }
});

app.get("/api/stockpiles/:id", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);

    const stockpile = await Stockpile.findOne({ _id: req.params.id, vendorId, isDeleted: { $ne: true } });
    if (!stockpile) return res.status(404).json({ message: "Stockpile not found" });

    res.json(stockpile);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stockpile" });
  }
});

app.patch("/api/stockpiles/:id", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const { customerName, customerPhone, customerEmail, endDate, deliveryPaid, deliveryDue, items, totalAmount, status, appendItems } = req.body;

    const updateData: any = {};
    if (customerName) updateData.customerName = customerName;
    if (customerPhone) updateData.customerPhone = customerPhone;
    if (customerEmail !== undefined) updateData.customerEmail = customerEmail;
    if (endDate) updateData.endDate = new Date(endDate);
    if (deliveryPaid !== undefined) updateData.deliveryPaid = deliveryPaid;
    if (deliveryDue !== undefined) updateData.deliveryDue = deliveryDue;
    if (status) updateData.status = status;

    const originalStockpile = await Stockpile.findOne({ _id: req.params.id, vendorId, isDeleted: { $ne: true } });
    if (!originalStockpile) return res.status(404).json({ message: "Stockpile not found" });

    let stockpile;
    if (appendItems && items) {
      stockpile = await Stockpile.findOneAndUpdate(
        { _id: req.params.id, vendorId, isDeleted: { $ne: true } },
        { 
          $push: { items: { $each: items } },
          $inc: { totalAmount: totalAmount || 0 },
          ...updateData
        },
        { new: true }
      );
    } else {
      if (items) updateData.items = items;
      if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
      stockpile = await Stockpile.findOneAndUpdate(
        { _id: req.params.id, vendorId, isDeleted: { $ne: true } },
        updateData,
        { new: true }
      );
    }

    if (!stockpile) return res.status(404).json({ message: "Stockpile not found" });

    const vendor = await User.findById(vendorId);
    if (vendor) {
      // Send WhatsApp notification if items were appended
      if (appendItems && items && items.length > 0) {
        await sendStockpileUpdateNotification(vendor, stockpile, items);
      }

      // Send extension notification if endDate was changed
      if (endDate && new Date(endDate).getTime() !== new Date(originalStockpile.endDate).getTime()) {
        await sendStockpileExtensionNotification(vendor, stockpile);
      }
    }

    res.json(stockpile);
  } catch (error) {
    console.error("Update stockpile error:", error);
    res.status(500).json({ message: "Error updating stockpile" });
  }
});

app.patch("/api/stockpiles/:id/status", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const { status } = req.body;

    const stockpile = await Stockpile.findOneAndUpdate(
      { _id: req.params.id, vendorId, isDeleted: { $ne: true } },
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!stockpile) return res.status(404).json({ message: "Stockpile not found" });

    res.json(stockpile);
  } catch (error) {
    res.status(500).json({ message: "Error updating stockpile status" });
  }
});

app.patch("/api/stockpiles/:id/toggle-delivery", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const stockpile = await Stockpile.findOne({ _id: req.params.id, vendorId, isDeleted: { $ne: true } });
    
    if (!stockpile) return res.status(404).json({ message: "Stockpile not found" });

    stockpile.status = stockpile.status === "active" ? "closed" : "active";
    stockpile.updatedAt = new Date();
    await stockpile.save();

    res.json(stockpile);
  } catch (error) {
    console.error("Toggle delivery error:", error);
    res.status(500).json({ message: "Error toggling delivery status" });
  }
});

app.patch("/api/stockpiles/bulk-status", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const { ids, status } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }

    await Stockpile.updateMany(
      { _id: { $in: ids }, vendorId, isDeleted: { $ne: true } },
      { status, updatedAt: new Date() }
    );

    res.json({ message: `Successfully marked ${ids.length} stockpiles as ${status}` });
  } catch (error) {
    console.error("Bulk status update error:", error);
    res.status(500).json({ message: "Error updating stockpiles" });
  }
});

app.post("/api/stockpiles/bulk-delete", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }

    const result = await Stockpile.updateMany(
      { _id: { $in: ids }, vendorId },
      { isDeleted: true, updatedAt: new Date() }
    );
    
    res.json({ message: `Successfully deleted ${result.modifiedCount} stockpiles` });
  } catch (error) {
    console.error("Bulk delete error:", error);
    res.status(500).json({ message: "Error deleting stockpiles" });
  }
});

app.delete("/api/stockpiles/:id", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);

    const result = await Stockpile.updateOne(
      { _id: req.params.id, vendorId },
      { isDeleted: true, updatedAt: new Date() }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: "Stockpile not found" });

    res.json({ message: "Stockpile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting stockpile" });
  }
});

app.get("/api/customers/check/:phone", authenticate, async (req: any, res) => {
  try {
    const vendorId = req.userId;
    const { phone } = req.params;
    
    // Find the most recent stockpile for this customer to get their name
    const existingStockpile = await Stockpile.findOne({ 
      vendorId, 
      customerPhone: phone,
      isDeleted: { $ne: true }
    }).sort({ createdAt: -1 });

    if (existingStockpile) {
      // Check if they have an active stockpile
      const activeStockpile = await Stockpile.findOne({
        vendorId,
        customerPhone: phone,
        status: "active",
        isDeleted: { $ne: true }
      });

      return res.json({ 
        exists: true, 
        customerName: existingStockpile.customerName,
        hasActiveStockpile: !!activeStockpile,
        activeStockpileId: activeStockpile?._id,
        endDate: activeStockpile?.endDate
      });
    }

    res.json({ exists: false });
  } catch (error) {
    console.error("Check customer error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/stockpile/log", authenticate, async (req: any, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.userId);
    const { customerName, customerPhone, customerEmail, endDate, deliveryPaid, deliveryDue, items, totalAmount } = req.body;
    
    // Get vendor info for WhatsApp message
    const vendor = await User.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    // Check for an active stockpile for this customer
    let stockpile = await Stockpile.findOne({
      vendorId,
      customerPhone,
      status: "active",
      isDeleted: { $ne: true }
    });

    if (stockpile) {
      // Append items and update total
      stockpile.items.push(...items.map((item: any) => ({ ...item, addedAt: new Date() })));
      stockpile.totalAmount += totalAmount;
      if (deliveryPaid !== undefined) stockpile.deliveryPaid = deliveryPaid;
      if (deliveryDue !== undefined) stockpile.deliveryDue = deliveryDue;
      await stockpile.save();
    } else {
      // Create new stockpile
      stockpile = new Stockpile({
        vendorId,
        customerName,
        customerPhone,
        customerEmail,
        endDate: new Date(endDate),
        deliveryPaid,
        deliveryDue: deliveryDue || 0,
        items,
        totalAmount,
        status: "active"
      });
      await stockpile.save();
    }

    // Update or create customer record
    await Customer.findOneAndUpdate(
      { vendorId, phone: customerPhone },
      { 
        name: customerName, 
        email: customerEmail,
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true, new: true }
    );

    // Send WhatsApp Notification via Kapso
    await sendStockpileUpdateNotification(vendor, stockpile, items);

    res.status(201).json({ 
      message: "Purchase logged successfully", 
      stockpile: {
        _id: stockpile._id,
        customerName: stockpile.customerName,
        totalAmount: stockpile.totalAmount,
        itemsCount: stockpile.items.length,
        endDate: stockpile.endDate
      }
    });
  } catch (error) {
    console.error("Log purchase error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  console.log("Register request received:", req.body.email);
  
  if (mongoose.connection.readyState !== 1) {
    console.error("MongoDB not connected. ReadyState:", mongoose.connection.readyState);
    return res.status(500).json({ message: "Database connection error. Please try again later." });
  }

  try {
    const { businessName, ownerName, email, whatsappNumber, password, businessCategory } = req.body;

    if (!businessName || !ownerName || !email || !whatsappNumber || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    
    // Split ownerName into firstName and lastName
    const nameParts = ownerName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const user = new User({
      businessName,
      ownerName,
      firstName,
      lastName,
      email,
      whatsappNumber,
      password: hashedPassword,
      businessCategory,
      isEmailVerified: false,
      verificationToken
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(email, firstName, verificationToken, req);

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: {
        id: user._id,
        businessName: user.businessName,
        ownerName: user.ownerName,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/auth/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isEmailVerified) return res.status(400).json({ message: "Email is already verified" });

    // Generate new token if needed, or reuse existing one
    if (!user.verificationToken) {
      user.verificationToken = crypto.randomBytes(32).toString("hex");
      await user.save();
    }

    const firstName = user.firstName || user.ownerName.split(" ")[0];
    const sent = await sendVerificationEmail(email, firstName, user.verificationToken, req);

    if (sent) {
      res.json({ message: "Verification email resent successfully" });
    } else {
      res.status(500).json({ message: "Failed to resend verification email" });
    }
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/auth/verify-email", async (req, res) => {
  try {
    const token = req.query.token as string;
    if (!token) return res.status(400).send("Verification token is missing");

    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).send("Invalid or expired verification token");

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await (user as any).save();

    // Send welcome email after email verification
    await sendWelcomeEmail(user.email, user.firstName || user.ownerName.split(" ")[0]);

    // Log the user in automatically
    const authToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "30d" });
    res.cookie("token", authToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      partitioned: true,
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    // Redirect to dashboard
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).send("Internal server error during verification");
  }
});

app.post("/api/auth/login", async (req, res) => {
  console.log("Login request received:", req.body.email);

  if (mongoose.connection.readyState !== 1) {
    console.error("MongoDB not connected. ReadyState:", mongoose.connection.readyState);
    return res.status(500).json({ message: "Database connection error. Please try again later." });
  }

  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "This account uses Google Sign-In. Please use the Google button to login." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const expiresIn = rememberMe ? "30d" : "24h";
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn });
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      partitioned: true, // Added for better iframe support
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    });

    res.json({
      message: "Login successful",
      token, // Send token in body as well
      user: {
        id: user._id,
        businessName: user.businessName,
        ownerName: user.ownerName,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/auth/me", authenticate, async (req: any, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      // For security, don't reveal if user exists
      return res.json({ message: "If an account exists with that email, an OTP has been sent." });
    }

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const sixtySecondsAgo = new Date(now.getTime() - 60 * 1000);

    // Filter attempts to only keep those from the last 5 minutes
    user.resetPasswordAttempts = (user.resetPasswordAttempts || []).filter(
      (attempt: Date) => attempt > fiveMinutesAgo
    );

    // Check for 60s cooldown
    const lastAttempt = user.resetPasswordAttempts[user.resetPasswordAttempts.length - 1];
    if (lastAttempt && lastAttempt > sixtySecondsAgo) {
      const waitTime = Math.ceil((lastAttempt.getTime() + 60000 - now.getTime()) / 1000);
      return res.status(429).json({ 
        message: `Please wait ${waitTime} seconds before requesting another OTP.`,
        retryAfter: waitTime
      });
    }

    // Check for 3 attempts in 5 minutes
    if (user.resetPasswordAttempts.length >= 3) {
      const firstAttempt = user.resetPasswordAttempts[0];
      const waitTime = Math.ceil((firstAttempt.getTime() + 300000 - now.getTime()) / 1000);
      return res.status(429).json({ 
        message: `Too many requests. Please wait ${Math.ceil(waitTime / 60)} minutes before trying again.`,
        retryAfter: waitTime
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Add current attempt
    user.resetPasswordAttempts.push(now);
    await user.save();

    const resend = getResend();
    if (resend) {
      await resend.emails.send({
        from: "Cartlist <onboarding@buynightflix.com>",
        to: email,
        subject: "Password Reset OTP",
        html: `
          <div style="font-family: 'Inter', sans-serif; background-color: #FDF8F3; padding: 40px; border-radius: 24px; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
            <div style="text-align: center; margin-bottom: 32px;">
              <img src="https://raw.githubusercontent.com/DannyYo696/svillage/cfdfd8520f96d8d336b2d00597bb7e5bde1cde14/cl%20logo.png" alt="Cartlist Logo" style="height: 48px;">
            </div>
            <div style="background-color: #FFFFFF; padding: 40px; border-radius: 32px; box-shadow: 0 4px 20px rgba(240, 126, 72, 0.05);">
              <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 16px; color: #1A1A1A;">Reset your password</h1>
              <p style="font-size: 16px; line-height: 1.6; color: #6B7280; margin-bottom: 32px;">
                Your OTP for password reset is:
              </p>
              <div style="text-align: center; margin-bottom: 32px;">
                <span style="font-size: 32px; font-weight: 800; color: #F07E48; letter-spacing: 4px;">${otp}</span>
              </div>
              <p style="font-size: 14px; color: #9CA3AF; text-align: center;">
                This OTP will expire in 10 minutes.
              </p>
            </div>
          </div>
        `
      });
    } else {
      console.log("OTP for", email, "is", otp);
    }

    res.json({ message: "If an account exists with that email, an OTP has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ 
      email, 
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ 
      email, 
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
