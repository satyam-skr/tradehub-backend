# Trading Platform API Documentation

A comprehensive RESTful API for a trading platform with authentication, order management, portfolio tracking, and real-time market data.

## 📚 API Documentation

Once the server is running, access the interactive Swagger UI documentation at:

```
http://localhost:4000/documentation
```

The Swagger UI provides:
- Complete API endpoint documentation
- Request/response schemas
- Interactive testing interface
- Authentication support
- Real-time WebSocket connection details

## 🚀 Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (copy `.env.sample` to `.env`):
```bash
cp .env.sample .env
```

3. Run database migrations:
```bash
npm run prisma:migrate
```

4. Start the development server:
```bash
npm run dev
```

5. Visit the API documentation:
```
http://localhost:4000/documentation
```

## 📋 API Endpoints Overview

### Authentication
- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/login` - Login and receive JWT token

### Orders
- `POST /api/v1/order/create` - Place a new order (requires authentication)
- `GET /api/v1/order/` - Get all my orders (requires authentication)
- `DELETE /api/v1/order/:orderId` - Cancel an order (requires authentication)
- `GET /api/v1/order/orderbook/:ticker` - Get order book for a ticker

### Portfolio
- `GET /api/v1/portfolio/` - Get user portfolio with holdings (requires authentication)

### Market
- `GET /api/v1/market/prices` - Get all stock prices
- `GET /api/v1/market/price/:symbol` - Get price for a specific symbol

### Chatbot (AI Trading Assistant)
- `POST /api/v1/stocky/chat` - Chat with AI trading assistant (requires authentication)

### WebSocket
- `WS /ws/market` - Real-time market price updates

---

## 📖 Detailed Endpoint Documentation

### Authentication Endpoints

#### 1. Register User
**POST** `/api/v1/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "statusCode": 201,
  "data": {
    "user": {
      "id": "cm5e8vf9s0000h8g2gqm5o3pr",
      "email": "user@example.com",
      "createdAt": "2026-01-02T10:30:00.000Z",
      "updatedAt": "2026-01-02T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "signup successful",
  "success": true
}
```

**Error Responses:**
- `400` - Validation error (invalid email format or password too short)
- `409` - User already exists

---

#### 2. Login User
**POST** `/api/v1/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "statusCode": 201,
  "data": {
    "user": {
      "id": "cm5e8vf9s0000h8g2gqm5o3pr",
      "email": "user@example.com",
      "createdAt": "2026-01-02T10:30:00.000Z",
      "updatedAt": "2026-01-02T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "login successful",
  "success": true
}
```

**Error Responses:**
- `400` - Validation error
- `401` - Invalid credentials
- `500` - Internal server error

---

### Order Endpoints

#### 3. Place Order
**POST** `/api/v1/order/create`

🔒 **Requires Authentication**

Create a new buy or sell order.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "symbol": "AAPL",
  "side": "BUY",
  "type": "LIMIT",
  "price": 150.50,
  "quantity": 10
}
```

**Field Descriptions:**
- `symbol` (string, required): Stock ticker symbol
- `side` (enum, required): "BUY" or "SELL"
- `type` (enum, required): "LIMIT" or "MARKET"
- `price` (number, conditional): Required for LIMIT orders, must NOT be provided for MARKET orders
- `quantity` (number, required): Order quantity (must be positive)

**Response (201):**
```json
{
  "statusCode": 201,
  "data": {
    "order": {
      "id": "cm5e8vf9s0001h8g2abcdefgh",
      "symbol": "AAPL",
      "side": "BUY",
      "type": "LIMIT",
      "price": 150.50,
      "quantity": 10,
      "filledQuantity": 0,
      "status": "OPEN",
      "userId": "cm5e8vf9s0000h8g2gqm5o3pr",
      "createdAt": "2026-01-02T10:35:00.000Z",
      "updatedAt": "2026-01-02T10:35:00.000Z"
    }
  },
  "message": "order created successfully",
  "success": true
}
```

**Error Responses:**
- `400` - Validation error (price missing for LIMIT, price provided for MARKET, etc.)
- `401` - Unauthorized (invalid or missing token)
- `500` - Error creating order

---

#### 4. Get My Orders
**GET** `/api/v1/order/`

🔒 **Requires Authentication**

Retrieve all orders for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "orders": [
      {
        "id": "cm5e8vf9s0001h8g2abcdefgh",
        "symbol": "AAPL",
        "side": "BUY",
        "type": "LIMIT",
        "price": 150.50,
        "quantity": 10,
        "filledQuantity": 5,
        "status": "PARTIAL",
        "userId": "cm5e8vf9s0000h8g2gqm5o3pr",
        "createdAt": "2026-01-02T10:35:00.000Z",
        "updatedAt": "2026-01-02T10:40:00.000Z"
      }
    ]
  },
  "message": "orders fetched successfully",
  "success": true
}
```

**Order Status Types:**
- `OPEN` - Order placed but not yet filled
- `PARTIAL` - Order partially filled
- `FILLED` - Order completely filled
- `CANCELLED` - Order cancelled

**Error Responses:**
- `400` - Unauthenticated

---

#### 5. Cancel Order
**DELETE** `/api/v1/order/:orderId`

🔒 **Requires Authentication**

Cancel/delete an order by its ID.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `orderId` (string): The ID of the order to cancel

**Example:**
```
DELETE /api/v1/order/cm5e8vf9s0001h8g2abcdefgh
```

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "orders deleted successfully",
  "success": true
}
```

**Error Responses:**
- `400` - Unauthenticated

---

#### 6. Get Order Book
**GET** `/api/v1/order/orderbook/:ticker`

Retrieve the order book (all bids and asks) for a specific stock ticker.

**URL Parameters:**
- `ticker` (string): Stock ticker symbol

**Example:**
```
GET /api/v1/order/orderbook/AAPL
```

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "orderBook": {
      "bids": [
        {
          "price": 150.25,
          "quantity": 100
        },
        {
          "price": 150.00,
          "quantity": 50
        }
      ],
      "asks": [
        {
          "price": 150.75,
          "quantity": 50
        },
        {
          "price": 151.00,
          "quantity": 75
        }
      ]
    }
  },
  "message": "orderBook fetched successfully",
  "success": true
}
```

**Note:** 
- Bids are sorted by price (highest first)
- Asks are sorted by price (lowest first)

---

### Chatbot Endpoints

#### 7. Chat with AI Trading Assistant
**POST** `/api/v1/stocky/chat`

🔒 **Requires Authentication**

Interact with "Stocky", the AI-powered trading assistant. Ask questions about stocks, market trends, trading strategies, portfolio analysis, and receive intelligent responses.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userMessage": "What are the top performing stocks today?"
}
```

**Field Descriptions:**
- `userMessage` (string, required): Your question or message to the chatbot

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "chatbotResponse": "Based on current market trends, technology stocks like AAPL and MSFT are showing strong performance. AAPL is up 2.5% today at $150.50, while MSFT has gained 1.8% trading at $350.25. These stocks have consistent trading volumes and positive momentum."
  },
  "message": "message sent and response received",
  "success": true
}
```

**Example Questions You Can Ask:**
- "What is the current price of AAPL?"
- "Should I buy or sell Tesla stock?"
- "What's my portfolio performance?"
- "Explain the difference between LIMIT and MARKET orders"
- "What are the risks of trading?"
- "Show me stocks under $100"
- "What's the market sentiment today?"

**Error Responses:**
- `400` - Bad request (no message provided)
- `401` - Unauthorized (invalid or missing token)

---

### Portfolio Endpoints

#### 8. Get Portfolio
**GET** `/api/v1/portfolio/`

🔒 **Requires Authentication**

Retrieve the authenticated user's portfolio including wallet balance and stock holdings.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "portfolio": {
      "wallet": {
        "id": "cm5e8vf9s0002h8g2wallet001",
        "userId": "cm5e8vf9s0000h8g2gqm5o3pr",
        "balance": 10000.50,
        "createdAt": "2026-01-02T10:30:00.000Z",
        "updatedAt": "2026-01-02T10:45:00.000Z"
      },
      "holdings": [
        {
          "id": "cm5e8vf9s0003h8g2xyz12345",
          "userId": "cm5e8vf9s0000h8g2gqm5o3pr",
          "symbol": "AAPL",
          "quantity": 50,
          "avgPrice": 145.30,
          "createdAt": "2026-01-02T10:35:00.000Z",
          "updatedAt": "2026-01-02T10:40:00.000Z"
        },
        {
          "id": "cm5e8vf9s0004h8g2xyz12346",
          "userId": "cm5e8vf9s0000h8g2gqm5o3pr",
          "symbol": "GOOGL",
          "quantity": 5,
          "avgPrice": 2750.00,
          "createdAt": "2026-01-02T10:38:00.000Z",
          "updatedAt": "2026-01-02T10:42:00.000Z"
        }
      ]
    }
  },
  "message": "Success",
  "success": true
}
```

**Error Responses:**
- `401` - Unauthorized

---

### Market Endpoints

#### 9. Get All Prices
**GET** `/api/v1/market/prices`

Retrieve current prices for all available stocks.

**Response (200):**
```json
{
  "AAPL": 150.50,
  "GOOGL": 2800.75,
  "MSFT": 350.25,
  "AMZN": 3400.00,
  "TSLA": 245.80
}
```

---

#### 10. Get Price by Symbol
**GET** `/api/v1/market/price/:symbol`

Retrieve the current price for a specific stock symbol.

**URL Parameters:**
- `symbol` (string): Stock ticker symbol

**Example:**
```
GET /api/v1/market/price/AAPL
```

**Response (200):**
```json
{
  "price": 150.50
}
```

---

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. After successful login or signup, you'll receive an `accessToken`.

### Using the Token

Include the token in your requests in one of two ways:

1. **Authorization Header (Recommended):**
```
Authorization: Bearer <your-token-here>
```

2. **Cookie:**
The token is also stored in a cookie named `accessToken` and will be automatically sent with requests.

### Protected Endpoints

The following endpoints require authentication:
- All Order endpoints except `/order/orderbook/:ticker`
- Portfolio endpoint (`/portfolio/`)
- Chatbot endpoint (`/stocky/chat`)

---

## 📝 Common Response Format

### Success Response
```json
{
  "statusCode": 200,
  "data": { /* response data */ },
  "message": "Success message",
  "success": true
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error message",
  "success": false,
  "errors": { /* validation errors if any */ }
}
```

---

## 🔄 Order Types Explained

### LIMIT Order
- Requires a `price` field
- Order will only execute at the specified price or better
- Example: "Buy 10 shares of AAPL at $150.50"

### MARKET Order
- Must NOT include a `price` field
- Order executes immediately at the best available price
- Example: "Buy 10 shares of AAPL at current market price"

---

## 🎯 Order Status Flow

```
OPEN → PARTIAL → FILLED
  ↓
CANCELLED
```

- **OPEN**: Order placed, waiting to be matched
- **PARTIAL**: Some quantity filled, remaining quantity still open
- **FILLED**: Order completely executed
- **CANCELLED**: Order cancelled by user

---

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Seed database
npm run seed
```

### Environment Variables

Required environment variables (`.env` file):

```env
DATABASE_URL="postgresql://..."
ACCESS_TOKEN_SECRET="your-secret-key"
ACCESS_TOKEN_EXPIRY="24h"
NODE_ENV="development"
PORT=3000
```

---

## 🧪 Testing the API

### Using Swagger UI
The easiest way to test the API is through the Swagger UI at `http://localhost:4000/documentation`.

1. Visit the Swagger docs
2. Click "Authorize" button
3. Enter your JWT token (with or without "Bearer " prefix)
4. Test any endpoint interactively

### Using cURL

**Signup:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Place Order (with token):**
```bash
curl -X POST http://localhost:4000/api/v1/order/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "symbol":"AAPL",
    "side":"BUY",
    "type":"LIMIT",
    "price":150.50,
    "quantity":10
  }'
```

---

## 📊 Example Workflows

### Complete Trading Workflow

1. **Register/Login**
```bash
POST /api/v1/auth/signup
# or
POST /api/v1/auth/login
# Save the accessToken from response
```

2. **Ask Chatbot for Advice** (Optional)
```bash
POST /api/v1/stocky/chat
{
  "userMessage": "What stocks should I consider buying today?"
}
# Get AI-powered recommendations
```

3. **Check Market Prices**
```bash
GET /api/v1/market/prices
# or for specific stock
GET /api/v1/market/price/AAPL
```

4. **View Portfolio**
```bash
GET /api/v1/portfolio/
# Check wallet balance and current holdings
```

5. **Place Buy Order**
```bash
POST /api/v1/order/create
{
  "symbol": "AAPL",
  "side": "BUY",
  "type": "LIMIT",
  "price": 150.50,
  "quantity": 10
}
```

6. **Check Order Status**
```bash
GET /api/v1/order/
# View all your orders and their status
```

7. **View Order Book**
```bash
GET /api/v1/order/orderbook/AAPL
# See all bids and asks for AAPL
```

8. **Connect to Real-Time Prices** (Optional)
```bash
# Connect WebSocket client to ws://localhost:4000/ws/market
# Receive live price updates every second
```

9. **Cancel Order (if needed)**
```bash
DELETE /api/v1/order/{orderId}
```

10. **View Updated Portfolio**
```bash
GET /api/v1/portfolio/
# Check updated holdings after trades execute
```

---

## 🔌 WebSocket Connection

### Real-Time Market Data

Connect to the WebSocket endpoint to receive real-time price updates for all stocks.

**WebSocket URL:**
```
ws://localhost:4000/ws/market
```

### Connection Example

**JavaScript/Browser:**
```javascript
const ws = new WebSocket('ws://localhost:4000/ws/market');

ws.onopen = () => {
  console.log('Connected to market data stream');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Price update:', data);
  // data.type === 'PRICE_UPDATE'
  // data.prices = { AAPL: 150.50, GOOGL: 2800.75, ... }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected from market data stream');
};
```

**Node.js:**
```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:4000/ws/market');

ws.on('open', () => {
  console.log('Connected to market data stream');
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('Price update:', message.prices);
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('close', () => {
  console.log('Disconnected from market data stream');
});
```

**Python:**
```python
import websocket
import json

def on_message(ws, message):
    data = json.loads(message)
    print(f"Price update: {data['prices']}")

def on_error(ws, error):
    print(f"Error: {error}")

def on_close(ws, close_status_code, close_msg):
    print("Connection closed")

def on_open(ws):
    print("Connected to market data stream")

ws = websocket.WebSocketApp(
    "ws://localhost:4000/ws/market",
    on_message=on_message,
    on_error=on_error,
    on_close=on_close,
    on_open=on_open
)

ws.run_forever()
```

### Message Format

The WebSocket server broadcasts price updates every second in the following format:

```json
{
  "type": "PRICE_UPDATE",
  "prices": {
    "AAPL": 150.52,
    "GOOGL": 2801.30,
    "MSFT": 350.45,
    "AMZN": 3401.25,
    "TSLA": 246.10
  }
}
```

### Features

- ✅ **Real-time Updates**: Prices broadcast every 1 second
- ✅ **All Stocks**: Receives updates for all available stocks simultaneously
- ✅ **No Authentication Required**: Public market data stream
- ✅ **Auto-reconnect**: Client should implement reconnection logic
- ✅ **Low Latency**: Direct WebSocket connection for minimal delay

### Use Cases

1. **Live Price Displays**: Build real-time dashboards showing current stock prices
2. **Trading Bots**: Receive instant price updates for algorithmic trading
3. **Price Alerts**: Monitor specific stocks and trigger alerts on price changes
4. **Market Analysis**: Collect real-time data for technical analysis
5. **Order Book Updates**: Combined with order book API for complete market view

### Notes

- The connection stays open until explicitly closed by client or server
- No messages need to be sent from client - data is broadcast automatically
- Prices are simulated in development environment
- Consider implementing exponential backoff for reconnection attempts

---

## 📚 Additional Resources

- **Swagger Documentation**: `http://localhost:4000/documentation`
- **Prisma Studio**: Run `npm run prisma:studio` to open database GUI
- **WebSocket Endpoint**: `ws://localhost:4000/ws/market` for real-time market data

---

## 🤝 Support

For issues or questions:
- Email: bt23cse082@iiitn.ac.in
- Check the interactive Swagger docs for real-time testing

---

## 📄 License

ISC

---

**Author:** Satyam Kumar Rai
