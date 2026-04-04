# API Documentation

Complete REST API reference for the Restaurant Platform.

## Base URL

```
Development: http://localhost:8080/api
Production: https://your-domain.com/api
```

## Authentication

All endpoints (except login) require JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Get Token

**Endpoint**: `POST /auth/login`

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@restaurant.com",
    "password": "admin123"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
    "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Admin User",
    "email": "admin@restaurant.com",
    "roles": ["ROLE_ADMIN", "ROLE_MANAGER"]
  }
}
```

## Authentication Endpoints

### 1. Login

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "user@restaurant.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "userId": "uuid",
    "name": "string",
    "email": "string",
    "roles": ["ROLE_ADMIN", "ROLE_MANAGER"]
  }
}
```

---

### 2. Refresh Token

**Endpoint**: `POST /auth/refresh`

**Request Body**:
```json
{
  "refreshToken": "string"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

---

### 3. Logout

**Endpoint**: `POST /auth/logout`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 4. Forgot Password

**Endpoint**: `POST /auth/forgot-password`

**Request Body**:
```json
{
  "email": "user@restaurant.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### 5. Reset Password

**Endpoint**: `POST /auth/reset-password`

**Request Body**:
```json
{
  "token": "reset-token-from-email",
  "newPassword": "newPassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## Order Endpoints

### 1. List Orders

**Endpoint**: `GET /orders`

**Query Parameters**:
- `page` (integer, default=0) - Page number
- `size` (integer, default=20) - Page size
- `sort` (string) - Sort by field (e.g., `createdAt,desc`)
- `status` (string) - Filter by status (PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED)
- `tableId` (uuid) - Filter by table

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "orderNumber": "ORD-001",
        "tableId": "uuid",
        "tableName": "Table 1",
        "status": "PENDING",
        "totalAmount": 250000,
        "items": [
          {
            "id": "uuid",
            "menuItemId": "uuid",
            "menuItemName": "Pizza Margherita",
            "quantity": 2,
            "unitPrice": 125000,
            "subtotal": 250000,
            "notes": "Extra cheese"
          }
        ],
        "createdAt": "2026-04-02T10:30:00Z",
        "updatedAt": "2026-04-02T10:35:00Z"
      }
    ],
    "pageNumber": 0,
    "pageSize": 20,
    "totalPages": 5,
    "totalElements": 95
  }
}
```

---

### 2. Create Order

**Endpoint**: `POST /orders`

**Request Body**:
```json
{
  "tableId": "uuid",
  "items": [
    {
      "menuItemId": "uuid",
      "quantity": 2,
      "notes": "Extra cheese, no onions"
    }
  ]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderNumber": "ORD-002",
    "status": "PENDING",
    "totalAmount": 250000,
    "items": [...],
    "createdAt": "2026-04-02T10:30:00Z"
  }
}
```

---

### 3. Get Order Details

**Endpoint**: `GET /orders/{orderId}`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderNumber": "ORD-001",
    "tableId": "uuid",
    "status": "CONFIRMED",
    "totalAmount": 250000,
    "items": [...]
  }
}
```

---

### 4. Update Order Status

**Endpoint**: `PUT /orders/{orderId}/status`

**Request Body**:
```json
{
  "status": "PREPARING"
}
```

**Valid Statuses**: PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "PREPARING",
    "updatedAt": "2026-04-02T10:35:00Z"
  }
}
```

---

### 5. Add Item to Order

**Endpoint**: `POST /orders/{orderId}/items`

**Request Body**:
```json
{
  "menuItemId": "uuid",
  "quantity": 1,
  "notes": "Well done"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "menuItemId": "uuid",
    "menuItemName": "Steak",
    "quantity": 1,
    "unitPrice": 150000,
    "subtotal": 150000
  }
}
```

---

### 6. Delete Order

**Endpoint**: `DELETE /orders/{orderId}`

**Response** (204 No Content)

---

## Table Endpoints

### 1. List Tables

**Endpoint**: `GET /tables`

**Query Parameters**:
- `status` (string) - Filter by status (AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE)
- `capacity` (integer) - Filter by minimum capacity

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tableNumber": 1,
      "capacity": 4,
      "status": "AVAILABLE",
      "location": "Main Hall",
      "currentOrder": null,
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

### 2. Update Table Status

**Endpoint**: `PUT /tables/{tableId}/status`

**Request Body**:
```json
{
  "status": "OCCUPIED"
}
```

**Valid Statuses**: AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tableNumber": 1,
    "status": "OCCUPIED"
  }
}
```

---

### 3. Create Table

**Endpoint**: `POST /tables`

**Request Body**:
```json
{
  "tableNumber": 1,
  "capacity": 4,
  "location": "Main Hall"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tableNumber": 1,
    "capacity": 4,
    "status": "AVAILABLE",
    "location": "Main Hall"
  }
}
```

---

## Reservation Endpoints

### 1. List Reservations

**Endpoint**: `GET /reservations`

**Query Parameters**:
- `page` (integer)
- `size` (integer)
- `status` (string) - PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
- `dateFrom` (date, ISO-8601)
- `dateTo` (date, ISO-8601)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "reservationNumber": "RES-001",
        "customerId": "uuid",
        "customerName": "John Doe",
        "customerPhone": "+84123456789",
        "tableId": "uuid",
        "guests": 4,
        "status": "CONFIRMED",
        "reservationTime": "2026-04-03T19:00:00Z",
        "specialRequest": "Window seat preferred",
        "createdAt": "2026-04-02T10:00:00Z"
      }
    ],
    "pageNumber": 0,
    "pageSize": 20,
    "totalPages": 2,
    "totalElements": 35
  }
}
```

---

### 2. Create Reservation

**Endpoint**: `POST /reservations`

**Request Body**:
```json
{
  "customerName": "John Doe",
  "customerPhone": "+84123456789",
  "customerEmail": "john@example.com",
  "guests": 4,
  "reservationTime": "2026-04-03T19:00:00Z",
  "specialRequest": "Window seat preferred"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "reservationNumber": "RES-001",
    "status": "PENDING",
    "reservationTime": "2026-04-03T19:00:00Z",
    "guests": 4
  }
}
```

---

### 3. Update Reservation Status

**Endpoint**: `PUT /reservations/{reservationId}/status`

**Request Body**:
```json
{
  "status": "CONFIRMED"
}
```

**Valid Statuses**: PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "CONFIRMED",
    "updatedAt": "2026-04-02T10:30:00Z"
  }
}
```

---

## Menu Endpoints

### 1. List Menu Items

**Endpoint**: `GET /menu/items`

**Query Parameters**:
- `page` (integer)
- `size` (integer)
- `categoryId` (uuid)
- `available` (boolean)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid",
        "name": "Pizza Margherita",
        "description": "Classic pizza with tomato and mozzarella",
        "category": {
          "id": "uuid",
          "name": "Pizza"
        },
        "price": 125000,
        "image": "https://cdn.example.com/pizza.jpg",
        "available": true,
        "preparationTime": 15
      }
    ],
    "pageNumber": 0,
    "pageSize": 20,
    "totalPages": 3,
    "totalElements": 45
  }
}
```

---

### 2. Create Menu Item

**Endpoint**: `POST /menu/items`

**Headers**: Requires ADMIN or MANAGER role

**Request Body**:
```json
{
  "name": "New Pizza",
  "description": "Delicious pizza",
  "categoryId": "uuid",
  "price": 150000,
  "preparationTime": 15,
  "available": true,
  "imageUrl": "https://cdn.example.com/pizza.jpg"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "New Pizza",
    "price": 150000,
    "available": true
  }
}
```

---

### 3. List Categories

**Endpoint**: `GET /menu/categories`

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Pizza",
      "description": "Delicious pizzas"
    },
    {
      "id": "uuid",
      "name": "Pasta",
      "description": "Italian pasta dishes"
    }
  ]
}
```

---

## Dashboard Endpoints

### 1. Get Dashboard Stats

**Endpoint**: `GET /dashboard`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalRevenue": 5000000,
    "totalOrders": 125,
    "totalReservations": 45,
    "occupiedTables": 8,
    "availableTables": 12,
    "orderStats": {
      "pending": 5,
      "confirmed": 10,
      "preparing": 3,
      "ready": 2,
      "completed": 105
    },
    "reservationStats": {
      "pending": 5,
      "confirmed": 30,
      "completed": 10
    },
    "revenueStats": {
      "today": 1200000,
      "thisWeek": 8500000,
      "thisMonth": 25000000
    },
    "topItems": [
      {
        "name": "Pizza Margherita",
        "quantity": 125,
        "revenue": 2500000
      }
    ]
  }
}
```

---

## Report Endpoints

### 1. Revenue Report

**Endpoint**: `GET /reports/revenue`

**Query Parameters**:
- `startDate` (date, ISO-8601)
- `endDate` (date, ISO-8601)
- `groupBy` (string) - DAY, WEEK, MONTH

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalRevenue": 10000000,
    "period": "2026-04-01 to 2026-04-02",
    "breakdown": [
      {
        "date": "2026-04-01",
        "revenue": 5000000,
        "orderCount": 50
      },
      {
        "date": "2026-04-02",
        "revenue": 5000000,
        "orderCount": 45
      }
    ]
  }
}
```

---

### 2. Top Selling Items

**Endpoint**: `GET /reports/top-items`

**Query Parameters**:
- `startDate` (date)
- `endDate` (date)
- `limit` (integer, default=10)

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "itemName": "Pizza Margherita",
      "quantity": 125,
      "revenue": 2500000,
      "category": "Pizza"
    },
    {
      "itemName": "Pasta Carbonara",
      "quantity": 98,
      "revenue": 1960000,
      "category": "Pasta"
    }
  ]
}
```

---

### 3. Occupancy Report

**Endpoint**: `GET /reports/occupancy`

**Query Parameters**:
- `startDate` (date)
- `endDate` (date)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalTables": 20,
    "averageOccupancy": 65,
    "peakHour": "19:00-20:00",
    "dailyStats": [
      {
        "date": "2026-04-02",
        "averageOccupancy": 65,
        "maxOccupancy": 80,
        "minOccupancy": 20
      }
    ]
  }
}
```

---

## Payment Endpoints

### 1. Create Payment

**Endpoint**: `POST /payments`

**Request Body**:
```json
{
  "orderId": "uuid",
  "amount": 250000,
  "paymentMethod": "VNPAY",
  "description": "Payment for order ORD-001"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "paymentUrl": "https://sandbox.vnpayment.vn/paygate/pay.html?...",
    "transactionId": "TXN-001",
    "amount": 250000,
    "status": "PENDING"
  }
}
```

---

### 2. Get Payment Status

**Endpoint**: `GET /payments/{paymentId}`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderId": "uuid",
    "amount": 250000,
    "status": "SUCCESS",
    "paymentMethod": "VNPAY",
    "transactionId": "TXN-001",
    "createdAt": "2026-04-02T10:30:00Z",
    "completedAt": "2026-04-02T10:35:00Z"
  }
}
```

---

## User Endpoints

### 1. Get Current User

**Endpoint**: `GET /users/me`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@restaurant.com",
    "phone": "+84123456789",
    "roles": ["ROLE_ADMIN", "ROLE_MANAGER"],
    "createdAt": "2026-01-01T00:00:00Z"
  }
}
```

---

### 2. Update Profile

**Endpoint**: `PUT /users/me`

**Request Body**:
```json
{
  "name": "New Name",
  "phone": "+84123456789"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "New Name",
    "email": "admin@restaurant.com"
  }
}
```

---

### 3. Change Password

**Endpoint**: `POST /users/change-password`

**Request Body**:
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Error Responses

All error responses follow this format:

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Invalid request parameters",
  "errors": {
    "email": "Email is required"
  }
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "message": "Insufficient permissions for this action"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "message": "An unexpected error occurred",
  "traceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## WebSocket Real-time Updates

Connect to WebSocket at: `ws://localhost:8080/ws` (or `wss://` for HTTPS)

Include JWT token in connection headers:
```javascript
headers: {
  Authorization: `Bearer ${accessToken}`
}
```

### Topics

**Orders Topic**: `/topic/orders/{tableId}`
```json
{
  "event": "ORDER_CREATED",
  "data": {
    "orderId": "uuid",
    "tableId": "uuid",
    "items": [...],
    "timestamp": "2026-04-02T10:30:00Z"
  }
}
```

**Tables Topic**: `/topic/tables`
```json
{
  "event": "TABLE_STATUS_CHANGED",
  "data": {
    "tableId": "uuid",
    "status": "OCCUPIED",
    "timestamp": "2026-04-02T10:30:00Z"
  }
}
```

**Reservations Topic**: `/topic/reservations`
```json
{
  "event": "RESERVATION_CREATED",
  "data": {
    "reservationId": "uuid",
    "status": "PENDING",
    "timestamp": "2026-04-02T10:30:00Z"
  }
}
```

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- **Per User**: 100 requests per minute
- **Per IP**: 1000 requests per minute

When rate limit exceeded, response includes:
```json
{
  "success": false,
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 60
}
```

---

## Pagination

List endpoints support pagination with these parameters:
- `page` (default: 0) - Zero-indexed page number
- `size` (default: 20, max: 100) - Items per page
- `sort` (example: `createdAt,desc`) - Sort field and direction

Response includes pagination info:
```json
{
  "pageNumber": 0,
  "pageSize": 20,
  "totalPages": 5,
  "totalElements": 95
}
```

---

## Swagger UI

Access interactive API documentation at:
```
http://localhost:8080/swagger-ui.html
```

---

**Last Updated**: 2026-04-02  
**Version**: 1.0.0  
**Status**: Complete
