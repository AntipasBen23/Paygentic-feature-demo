// src/lib/data/mockData.ts

import { faker } from '@faker-js/faker';

// Set seed for consistent data
faker.seed(12345);

export interface Company {
  id: string;
  name: string;
  industry: 'LLM API' | 'AI Agent' | 'Computer Vision' | 'Audio AI' | 'Code Generation';
  pricingModel: 'usage' | 'outcome' | 'hybrid' | 'subscription';
  currentPrice: number;
  recommendedPrice: number;
  monthlyRevenue: number;
  monthlyUsage: number;
  churnRisk: 'low' | 'medium' | 'high';
  churnProbability: number;
  revenueLeak: number;
  revenueLeakPercent: number;
  customerSince: Date;
  lastActive: Date;
}

export interface UsageEvent {
  companyId: string;
  date: Date;
  usage: number;
  revenue: number;
}

export interface CompetitorPricing {
  competitor: string;
  industry: string;
  pricingModel: string;
  pricePerUnit: number;
  marketPosition: 'premium' | 'mid-market' | 'budget';
}

// Generate companies
function generateCompanies(count: number): Company[] {
  const companies: Company[] = [];
  
  for (let i = 0; i < count; i++) {
    const industry = faker.helpers.arrayElement([
      'LLM API',
      'AI Agent',
      'Computer Vision',
      'Audio AI',
      'Code Generation'
    ]) as Company['industry'];
    
    const pricingModel = faker.helpers.arrayElement([
      'usage',
      'outcome',
      'hybrid',
      'subscription'
    ]) as Company['pricingModel'];
    
    const monthlyUsage = faker.number.int({ min: 1000, max: 1000000 });
    const currentPrice = faker.number.float({ min: 0.001, max: 0.05, precision: 0.001 });
    const monthlyRevenue = monthlyUsage * currentPrice;
    
    // Calculate optimal price (simple heuristic)
    const marketMultiplier = faker.number.float({ min: 1.1, max: 1.8, precision: 0.1 });
    const recommendedPrice = currentPrice * marketMultiplier;
    
    // Revenue leak calculation
    const potentialRevenue = monthlyUsage * recommendedPrice;
    const revenueLeak = potentialRevenue - monthlyRevenue;
    const revenueLeakPercent = (revenueLeak / monthlyRevenue) * 100;
    
    // Churn calculation (higher leak = higher churn risk)
    const churnProbability = Math.min(
      faker.number.int({ min: 5, max: 95 }),
      revenueLeakPercent > 40 ? faker.number.int({ min: 60, max: 90 }) : faker.number.int({ min: 5, max: 40 })
    );
    
    const churnRisk: Company['churnRisk'] = 
      churnProbability > 60 ? 'high' : 
      churnProbability > 30 ? 'medium' : 'low';
    
    companies.push({
      id: faker.string.uuid(),
      name: faker.company.name(),
      industry,
      pricingModel,
      currentPrice,
      recommendedPrice,
      monthlyRevenue,
      monthlyUsage,
      churnRisk,
      churnProbability,
      revenueLeak,
      revenueLeakPercent,
      customerSince: faker.date.past({ years: 2 }),
      lastActive: faker.date.recent({ days: 7 })
    });
  }
  
  return companies;
}

// Generate usage events (last 6 months)
function generateUsageEvents(companies: Company[]): UsageEvent[] {
  const events: UsageEvent[] = [];
  const daysToGenerate = 180;
  
  companies.forEach(company => {
    for (let i = 0; i < daysToGenerate; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Add some variance to usage
      const variance = faker.number.float({ min: 0.7, max: 1.3, precision: 0.01 });
      const dailyUsage = (company.monthlyUsage / 30) * variance;
      const dailyRevenue = dailyUsage * company.currentPrice;
      
      events.push({
        companyId: company.id,
        date,
        usage: dailyUsage,
        revenue: dailyRevenue
      });
    }
  });
  
  return events;
}

// Generate competitor pricing data
function generateCompetitorPricing(): CompetitorPricing[] {
  const competitors = [
    'Stripe Billing',
    'Chargebee',
    'Recurly',
    'Lago',
    'Metronome',
    'Orb',
    'Octane',
    'Stigg'
  ];
  
  return competitors.map(competitor => ({
    competitor,
    industry: faker.helpers.arrayElement(['LLM API', 'AI Agent', 'Computer Vision']),
    pricingModel: faker.helpers.arrayElement(['usage-based', 'outcome-based', 'hybrid']),
    pricePerUnit: faker.number.float({ min: 0.002, max: 0.08, precision: 0.001 }),
    marketPosition: faker.helpers.arrayElement(['premium', 'mid-market', 'budget']) as CompetitorPricing['marketPosition']
  }));
}

// Main data export
export const mockData = {
  companies: generateCompanies(50),
  usageEvents: [] as UsageEvent[], // Will be generated lazily
  competitorPricing: generateCompetitorPricing()
};

// Generate usage events for companies (call this once)
mockData.usageEvents = generateUsageEvents(mockData.companies);

// Helper functions
export function getCompanyById(id: string): Company | undefined {
  return mockData.companies.find(c => c.id === id);
}

export function getTopRevenueLeaks(limit: number = 10): Company[] {
  return [...mockData.companies]
    .sort((a, b) => b.revenueLeak - a.revenueLeak)
    .slice(0, limit);
}

export function getHighChurnRiskCompanies(): Company[] {
  return mockData.companies.filter(c => c.churnRisk === 'high');
}

export function getTotalRevenueLeak(): number {
  return mockData.companies.reduce((sum, c) => sum + c.revenueLeak, 0);
}

export function getUsageByCompany(companyId: string, days: number = 30): UsageEvent[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return mockData.usageEvents
    .filter(e => e.companyId === companyId && e.date >= cutoffDate)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}