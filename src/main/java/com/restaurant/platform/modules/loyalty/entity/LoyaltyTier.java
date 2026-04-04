package com.restaurant.platform.modules.loyalty.entity;

public enum LoyaltyTier {
    SILVER(0, 1.0),        // Base tier, 1x points
    GOLD(500, 1.5),        // 500 points required, 1.5x points
    PLATINUM(1500, 2.0),   // 1500 points required, 2x points
    DIAMOND(5000, 3.0);    // 5000 points required, 3x points

    private final int requiredPoints;
    private final double pointsMultiplier;

    LoyaltyTier(int requiredPoints, double pointsMultiplier) {
        this.requiredPoints = requiredPoints;
        this.pointsMultiplier = pointsMultiplier;
    }

    public int getRequiredPoints() {
        return requiredPoints;
    }

    public double getPointsMultiplier() {
        return pointsMultiplier;
    }

    public static LoyaltyTier fromTotalPoints(int totalPoints) {
        if (totalPoints >= DIAMOND.requiredPoints) return DIAMOND;
        if (totalPoints >= PLATINUM.requiredPoints) return PLATINUM;
        if (totalPoints >= GOLD.requiredPoints) return GOLD;
        return SILVER;
    }
}
