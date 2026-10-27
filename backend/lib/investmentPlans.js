export const INVESTMENT_PLANS = [
  { code: "standard", name: "Standard", minimum: 1500, maximum: 5000, roiPercent: 5, intervalHours: 48, intervalLabel: "Every 48 Hours" },
  { code: "premium", name: "Premium", minimum: 5000, maximum: 20000, roiPercent: 7, intervalHours: 96, intervalLabel: "Every 4 Days" },
  { code: "ultimate", name: "Ultimate", minimum: 20000, maximum: null, roiPercent: 10, intervalHours: 48, intervalLabel: "Every 2 Days" },
  { code: "platinum", name: "Platinum", minimum: 40000, maximum: null, roiPercent: 20, intervalHours: 48, intervalLabel: "Every 2 Days" },
  { code: "premium-gold", name: "Premium Gold", minimum: 500000, maximum: null, roiPercent: 45, intervalHours: 24, intervalLabel: "Daily" },
];
