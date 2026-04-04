# 📋 Remaining Business Logic Issues

**Status**: Not yet implemented  
**Priority**: MODERATE to LOW  
**Date**: April 3, 2026

---

## Overview

3 additional business logic issues identified that require further attention. These are moderate priority and can be addressed in a follow-up phase.

---

## Issue #1: Table Status Update Race Condition

**File**: `OrderServiceImpl.java` (Lines 79, 183)  
**Severity**: 🟡 MODERATE

### Problem
```java
// Line 79: Order creation
table.setStatus(TableStatus.OCCUPIED);
orderRepository.save(order); // Table save relies on cascade

// Line 183: Pay method  
table.setStatus(TableStatus.AVAILABLE);
return mapToResponse(order); // Table NOT explicitly saved!
```

### Impact
- Table status updates rely on JPA transaction cascade
- If transaction partially fails, table status could be inconsistent
- No explicit save ensures data persistence

### Recommended Fix
```java
// In pay() method:
Table table = order.getTable();
table.setStatus(TableStatus.AVAILABLE);
tableRepository.save(table); // Explicit save

// In updateStatus() method:
Order order = getOrderOrThrow(orderId);
order.setStatus(status);
if (status == OrderStatus.PAID) {
    Table table = order.getTable();
    table.setStatus(TableStatus.AVAILABLE);
    tableRepository.save(table); // Add explicit save
}
return mapToResponse(orderRepository.save(order));
```

### Test Scenario
```
1. Create order for table (status = OCCUPIED)
2. Pay order (status = AVAILABLE)
3. Verify in database: table.status = AVAILABLE
```

---

## Issue #2: Loyalty Points Multiplier Strategy

**File**: `LoyaltyServiceImpl.java` (Line 99)  
**Severity**: 🟡 MODERATE

### Problem
```java
double multiplier = acc.getTier().getPointsMultiplier();
BigDecimal earnedPoints = amount.multiply(BigDecimal.valueOf(multiplier / 10));
// Amount $100, GOLD tier (1.5x): 100 * (1.5 / 10) = 15 points

// Current formula: 1 point per $10 * multiplier
// SILVER (1.0x): 0.1 points per $1 = 10 points per $100
// GOLD (1.5x): 0.15 points per $1 = 15 points per $100
// PLATINUM (2.0x): 0.2 points per $1 = 20 points per $100
// DIAMOND (3.0x): 0.3 points per $1 = 30 points per $100
```

### Questions to Review
1. **Is the multiplier correct?**
   - 1.5x multiplier means only 50% bonus?
   - Should it be 2.0x (100% bonus), 3.0x (200% bonus)?

2. **Is the points formula correct?**
   - "1 point per $10" seems low
   - Should it be "1 point per $1" instead?

3. **Base multiplier vs Bonus multiplier?**
   ```
   // Current interpretation (multiplier = bonus multiplier):
   Base: 10 points per $100
   GOLD: 10 * 1.5 = 15 points per $100
   
   // Alternative interpretation (multiplier = total multiplier):
   SILVER: 10 points per $100
   GOLD: 10 * 1.5 = 15 points per $100
   ```

### Recommended Action
**Review with business team**:
- Confirm intended points earning rate for each tier
- Verify multiplier strategy aligns with loyalty program goals
- Update if calculation is incorrect

### Example Fix (if base should be 1 point per $1)
```java
// If formula should be 1 point per $1 * multiplier:
double multiplier = acc.getTier().getPointsMultiplier();
BigDecimal earnedPoints = amount.multiply(BigDecimal.valueOf(multiplier));
// $100 at GOLD (1.5x): 100 * 1.5 = 150 points

// Or if multiplier means "total earning rate":
// SILVER (0.1x): 0.1 points per $1 = 10 per $100
// GOLD (0.15x): 0.15 points per $1 = 15 per $100
```

### Test Scenario
```
1. Create account with SILVER tier
2. Make $100 purchase → verify points earned
3. Upgrade to GOLD tier
4. Make $100 purchase → verify points are higher
5. Confirm calculation matches business expectations
```

---

## Issue #3: Hardcoded Payment Gateway URLs

**File**: `PaymentServiceImpl.java` (Lines 54-60)  
**Severity**: 🟡 MODERATE

### Problem
```java
private String generatePaymentUrl(Payment payment, String method) {
    if ("VNPAY".equalsIgnoreCase(method)) {
        return "https://sandbox.vnpayment.vn/paymentgate/Embedded?token=" + payment.getId();
    } else if ("MOMO".equalsIgnoreCase(method)) {
        return "https://test-payment.momo.vn/web/paymentgateway?token=" + payment.getId();
    } else {
        return "https://payment-gateway.restaurant.local/callback/" + payment.getId();
    }
}
```

### Impact
- URLs hardcoded in source code
- Cannot change URLs without code deployment
- Sandbox URLs embedded (not production-ready)
- No flexibility for different environments

### Recommended Fix
```java
// In application.properties or application.yml:
payment.gateway.vnpay.url=https://sandbox.vnpayment.vn/paymentgate/Embedded
payment.gateway.momo.url=https://test-payment.momo.vn/web/paymentgateway
payment.gateway.default.url=https://payment-gateway.restaurant.local/callback

// In PaymentServiceImpl:
@Value("${payment.gateway.vnpay.url}")
private String vnpayUrl;

@Value("${payment.gateway.momo.url}")
private String momoUrl;

@Value("${payment.gateway.default.url}")
private String defaultUrl;

private String generatePaymentUrl(Payment payment, String method) {
    if ("VNPAY".equalsIgnoreCase(method)) {
        return vnpayUrl + "?token=" + payment.getId();
    } else if ("MOMO".equalsIgnoreCase(method)) {
        return momoUrl + "?token=" + payment.getId();
    } else {
        return defaultUrl + "/" + payment.getId();
    }
}
```

### Application Configuration
```yaml
# application-dev.yml
payment:
  gateway:
    vnpay:
      url: https://sandbox.vnpayment.vn/paymentgate/Embedded
    momo:
      url: https://test-payment.momo.vn/web/paymentgateway
    default:
      url: https://payment-gateway.restaurant.local/callback

# application-prod.yml
payment:
  gateway:
    vnpay:
      url: https://secure.vnpayment.vn/paymentgate/Embedded
    momo:
      url: https://payment.momo.vn/web/paymentgateway
    default:
      url: https://payment-gateway.restaurant.vn/callback
```

---

## Issue #4: Missing Null Validation in Profile Update

**File**: `ProfileService.java` (Lines 49-57)  
**Severity**: 🟢 MINOR

### Problem
```java
public ProfileResponse updateProfile(UpdateProfileRequest request) {
    // No validation on request body fields before update
    if (request.getName() != null) {
        user.setName(request.getName()); // Could be empty string ""
    }
    if (request.getPhone() != null) {
        user.setPhone(request.getPhone()); // No format validation
    }
    if (request.getAddress() != null) {
        user.setAddress(request.getAddress()); // Could be empty string ""
    }
}
```

### Impact
- Empty strings accepted as valid updates
- No phone number format validation
- Data quality degrades over time

### Recommended Fix
```java
public ProfileResponse updateProfile(UpdateProfileRequest request) {
    String email = SecurityUtils.getCurrentUsername();
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found"));

    if (request.getName() != null && !request.getName().trim().isEmpty()) {
        user.setName(request.getName().trim());
    }
    if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
        if (!isValidPhone(request.getPhone())) {
            throw new BadRequestException("INVALID_PHONE", "Phone number format is invalid");
        }
        user.setPhone(request.getPhone().trim());
    }
    if (request.getAddress() != null && !request.getAddress().trim().isEmpty()) {
        user.setAddress(request.getAddress().trim());
    }

    User updatedUser = userRepository.save(user);
    // ... build response
}

private boolean isValidPhone(String phone) {
    // Simple validation: 10-11 digits, optional +84, optional leading 0
    return phone.matches("^(\\+84|0)?[1-9][0-9]{8,10}$");
}
```

---

## Remaining Issues Summary

| # | Issue | File | Severity | Type | Priority |
|---|-------|------|----------|------|----------|
| 1 | Table status race condition | OrderServiceImpl.java | 🟡 MODERATE | Data Consistency | HIGH |
| 2 | Loyalty multiplier strategy | LoyaltyServiceImpl.java | 🟡 MODERATE | Business Logic | HIGH |
| 3 | Hardcoded gateway URLs | PaymentServiceImpl.java | 🟡 MODERATE | Configuration | MEDIUM |
| 4 | Null validation in profile | ProfileService.java | 🟢 MINOR | Data Quality | LOW |

---

## Recommendations

### Phase 2 Implementation Plan
1. **Fix table status race condition** (Quick win, high impact)
2. **Review loyalty multiplier** with business team
3. **Extract payment gateway URLs** to configuration
4. **Add profile field validation** as part of data quality initiative

### Estimated Effort
- Table status fix: 30 minutes
- Loyalty review: 1-2 hours (includes business discussion)
- Payment config: 45 minutes
- Profile validation: 1 hour

---

**Created by**: GitHub Copilot CLI  
**Date**: April 3, 2026  
**Status**: Pending Implementation
