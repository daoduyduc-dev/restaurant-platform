package com.restaurant.platform.modules.loyalty.entity;

public enum LoyaltyTier {
    SILVER(0, 1.0, 0),           // Base tier, 1x points, 0% discount
    GOLD(500, 1.5, 5),          // 500 points, 1.5x points, -5% discount
    PLATINUM(1500, 2.0, 10),    // 1500 points, 2x points, -10% discount
    DIAMOND(5000, 3.0, 20);     // 5000 points, 3x points, -20% discount

    private final int requiredPoints;
    private final double pointsMultiplier;
    private final int discountPercent;

    LoyaltyTier(int requiredPoints, double pointsMultiplier, int discountPercent) {
        this.requiredPoints = requiredPoints;
        this.pointsMultiplier = pointsMultiplier;
        this.discountPercent = discountPercent;
    }

    public int getRequiredPoints() {
        return requiredPoints;
    }

    public double getPointsMultiplier() {
        return pointsMultiplier;
    }

    public int getDiscountPercent() {
        return discountPercent;
    }

    public static LoyaltyTier fromTotalPoints(int totalPoints) {
        if (totalPoints >= DIAMOND.requiredPoints) return DIAMOND;
        if (totalPoints >= PLATINUM.requiredPoints) return PLATINUM;
        if (totalPoints >= GOLD.requiredPoints) return GOLD;
        return SILVER;
    }
}
