// src/lib/analytics.ts

import { Company, UsageEvent, mockData } from './data/mockData';

export interface DashboardStats {
  totalRevenueLeak: number;
  totalRevenueLeakPercent: number;
  highRiskCustomers: number;
  avgChurnProbability: number;
  monthlyRevenue: number;
  potentialRevenue: number;
}

export interface RevenueLeakCell {
  companyId: string;
  companyName: string;
  industry: Company['industry'];
  leakAmount: number;
  leakPercent: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ChurnPrediction {
  companyId: string;
  companyName: string;
  probability: number;
  risk: Company['churnRisk'];
  reason: string;
  recommendation: string;
}

export interface PricingSimulation {
  currentRevenue: number;
  projectedRevenue: number;
  revenueChange: number;
  revenueChangePercent: number;
  churnImpact: number;
  netRevenue: number;
}

// Calculate dashboard overview stats
export function getDashboardStats(): DashboardStats {
  const companies = mockData.companies;
  
  const totalRevenueLeak = companies.reduce((sum, c) => sum + c.revenueLeak, 0);
  const monthlyRevenue = companies.reduce((sum, c) => sum + c.monthlyRevenue, 0);
  const potentialRevenue = monthlyRevenue + totalRevenueLeak;
  const totalRevenueLeakPercent = (totalRevenueLeak / monthlyRevenue) * 100;
  
  const highRiskCustomers = companies.filter(c => c.churnRisk === 'high').length;
  const avgChurnProbability = companies.reduce((sum, c) => sum + c.churnProbability, 0) / companies.length;
  
  return {
    totalRevenueLeak,
    totalRevenueLeakPercent,
    highRiskCustomers,
    avgChurnProbability,
    monthlyRevenue,
    potentialRevenue
  };
}

// Generate revenue leak heatmap data
export function getRevenueLeakHeatmap(): RevenueLeakCell[] {
  return mockData.companies.map(company => {
    let severity: RevenueLeakCell['severity'];
    
    if (company.revenueLeakPercent > 50) severity = 'critical';
    else if (company.revenueLeakPercent > 30) severity = 'high';
    else if (company.revenueLeakPercent > 15) severity = 'medium';
    else severity = 'low';
    
    return {
      companyId: company.id,
      companyName: company.name,
      industry: company.industry,
      leakAmount: company.revenueLeak,
      leakPercent: company.revenueLeakPercent,
      severity
    };
  }).sort((a, b) => b.leakAmount - a.leakAmount);
}

// Get churn predictions with reasons
export function getChurnPredictions(limit: number = 20): ChurnPrediction[] {
  return mockData.companies
    .filter(c => c.churnProbability > 30)
    .sort((a, b) => b.churnProbability - a.churnProbability)
    .slice(0, limit)
    .map(company => {
      // Generate reason based on data
      let reason = '';
      let recommendation = '';
      
      if (company.revenueLeakPercent > 40) {
        reason = `Pricing ${company.revenueLeakPercent.toFixed(0)}% below market average`;
        recommendation = `Increase price to $${company.recommendedPrice.toFixed(4)}/unit`;
      } else if (company.churnProbability > 60) {
        reason = 'High usage volatility detected';
        recommendation = 'Consider switching to outcome-based pricing';
      } else {
        reason = 'Usage declining over last 30 days';
        recommendation = 'Offer volume discount or usage credits';
      }
      
      return {
        companyId: company.id,
        companyName: company.name,
        probability: company.churnProbability,
        risk: company.churnRisk,
        reason,
        recommendation
      };
    });
}

// Simulate pricing change impact
export function simulatePricingChange(
  companyId: string,
  newPrice: number
): PricingSimulation {
  const company = mockData.companies.find(c => c.id === companyId);
  if (!company) {
    throw new Error('Company not found');
  }
  
  const currentRevenue = company.monthlyRevenue;
  const projectedRevenue = company.monthlyUsage * newPrice;
  
  // Simple churn model: every 10% price increase = 5% churn risk increase
  const priceChangePercent = ((newPrice - company.currentPrice) / company.currentPrice) * 100;
  const churnImpact = Math.max(0, priceChangePercent * 0.5);
  
  // Adjust for churn
  const retentionRate = 1 - (churnImpact / 100);
  const netRevenue = projectedRevenue * retentionRate;
  
  const revenueChange = netRevenue - currentRevenue;
  const revenueChangePercent = (revenueChange / currentRevenue) * 100;
  
  return {
    currentRevenue,
    projectedRevenue,
    revenueChange,
    revenueChangePercent,
    churnImpact,
    netRevenue
  };
}

// Get revenue trend data (last 90 days)
export function getRevenueTrend(companyId?: string): Array<{ date: string; revenue: number }> {
  const events = companyId
    ? mockData.usageEvents.filter(e => e.companyId === companyId)
    : mockData.usageEvents;
  
  // Group by day
  const dailyRevenue = new Map<string, number>();
  
  events.forEach(event => {
    const dateKey = event.date.toISOString().split('T')[0];
    const current = dailyRevenue.get(dateKey) || 0;
    dailyRevenue.set(dateKey, current + event.revenue);
  });
  
  // Convert to array and sort
  return Array.from(dailyRevenue.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-90); // Last 90 days
}

// Get pricing distribution by model
export function getPricingDistribution(): Array<{
  model: string;
  count: number;
  avgRevenue: number;
}> {
  const distribution = new Map<string, { count: number; totalRevenue: number }>();
  
  mockData.companies.forEach(company => {
    const current = distribution.get(company.pricingModel) || { count: 0, totalRevenue: 0 };
    distribution.set(company.pricingModel, {
      count: current.count + 1,
      totalRevenue: current.totalRevenue + company.monthlyRevenue
    });
  });
  
  return Array.from(distribution.entries()).map(([model, data]) => ({
    model,
    count: data.count,
    avgRevenue: data.totalRevenue / data.count
  }));
}

// Get competitive analysis
export function getCompetitiveAnalysis() {
  const avgPrice = mockData.companies.reduce((sum, c) => sum + c.currentPrice, 0) / mockData.companies.length;
  const competitorAvg = mockData.competitorPricing.reduce((sum, c) => sum + c.pricePerUnit, 0) / mockData.competitorPricing.length;
  
  const position = avgPrice > competitorAvg ? 'above' : 'below';
  const difference = ((avgPrice - competitorAvg) / competitorAvg) * 100;
  
  return {
    yourAvgPrice: avgPrice,
    marketAvgPrice: competitorAvg,
    position,
    differencePercent: Math.abs(difference),
    competitors: mockData.competitorPricing.slice(0, 5)
  };
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Format percentage
export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

// Format price per unit
export function formatPricePerUnit(price: number): string {
  return `$${price.toFixed(4)}`;
}