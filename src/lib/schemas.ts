import { z } from 'zod';

/**
 * Intake Module Schema (gz-intake)
 */
export const IntakeModuleSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().min(1, 'Name required'),
    age: z.number().min(18, 'Must be 18+').optional(),
    education: z.string().optional(),
    industry: z.string().min(1, 'Industry required'),
    experience: z.string().optional(),
  }).optional(),
  
  businessIdea: z.object({
    description: z.string().min(10, 'Description too short'),
    targetMarket: z.string().optional(),
    problem: z.string().optional(),
    solution: z.string().optional(),
  }).optional(),
  
  entrepreneurialProfile: z.object({
    needForAchievement: z.number().min(1).max(5).optional(),
    locusOfControl: z.number().min(1).max(5).optional(),
    riskTaking: z.number().min(1).max(5).optional(),
    tolerance: z.number().min(1).max(5).optional(),
  }).optional(),
  
  businessType: z.enum([
    'service',
    'product',
    'hybrid',
    'online',
    'consulting',
    'retail'
  ]).optional(),
  
  relevantModules: z.array(z.string()).optional(),
});

/**
 * Business Model Schema (gz-geschaeftsmodell)
 */
export const BusinessModelSchema = z.object({
  valueProposition: z.object({
    customerJobs: z.array(z.string()).optional(),
    pains: z.array(z.string()).optional(),
    gains: z.array(z.string()).optional(),
    products: z.array(z.string()).optional(),
    painRelievers: z.array(z.string()).optional(),
    gainCreators: z.array(z.string()).optional(),
  }).optional(),
  
  targetAudience: z.object({
    personas: z.array(z.object({
      name: z.string(),
      demographics: z.string(),
      goals: z.array(z.string()),
      painPoints: z.array(z.string()),
    })).optional(),
  }).optional(),
  
  offering: z.object({
    description: z.string().optional(),
    features: z.array(z.string()).optional(),
    benefits: z.array(z.string()).optional(),
    pricing: z.string().optional(),
  }).optional(),
  
  usp: z.string().optional(),
});

/**
 * Company Structure Schema (gz-unternehmen)
 */
export const CompanySchema = z.object({
  legalForm: z.enum([
    'einzelunternehmen',
    'gbr',
    'ug',
    'gmbh',
    'other'
  ]).optional(),
  
  management: z.object({
    founder: z.string().optional(),
    partners: z.array(z.string()).optional(),
    responsibilities: z.string().optional(),
  }).optional(),
  
  location: z.object({
    address: z.string().optional(),
    reasons: z.string().optional(),
    infrastructure: z.string().optional(),
  }).optional(),
  
  insurance: z.array(z.object({
    type: z.string(),
    provider: z.string().optional(),
    coverage: z.string().optional(),
  })).optional(),
});

/**
 * Financial Planning Schema (gz-finanzplanung)
 */
export const FinancialPlanSchema = z.object({
  startupCapital: z.object({
    total: z.number().nonnegative(),
    breakdown: z.array(z.object({
      category: z.string(),
      amount: z.number().nonnegative(),
      description: z.string().optional(),
    })),
  }).optional(),
  
  personalWithdrawal: z.object({
    monthly: z.number().nonnegative(),
    annual: z.number().nonnegative(),
    justification: z.string().optional(),
  }).optional(),
  
  revenueProjection: z.object({
    year1: z.number().nonnegative().optional(),
    year2: z.number().nonnegative().optional(),
    year3: z.number().nonnegative().optional(),
    assumptions: z.string().optional(),
  }).optional(),
  
  profitability: z.object({
    breakEvenMonth: z.number().min(1).max(36).optional(),
    year1Profit: z.number().optional(),
    year2Profit: z.number().optional(),
    year3Profit: z.number().optional(),
  }).optional(),
  
  liquidity: z.object({
    cashReserve: z.number().nonnegative().optional(),
    criticalMonths: z.array(z.number()).optional(),
  }).optional(),
});

/**
 * Marketing Schema (gz-marketing)
 */
export const MarketingSchema = z.object({
  targetAudience: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    personas: z.array(z.object({
      name: z.string(),
      characteristics: z.string(),
    })).optional(),
  }).optional(),
  
  marketingMix: z.object({
    product: z.string().optional(),
    price: z.string().optional(),
    place: z.string().optional(),
    promotion: z.string().optional(),
  }).optional(),
  
  channels: z.array(z.object({
    name: z.string(),
    strategy: z.string().optional(),
    budget: z.number().optional(),
  })).optional(),
  
  budget: z.object({
    total: z.number().nonnegative().optional(),
    breakdown: z.array(z.object({
      channel: z.string(),
      amount: z.number().nonnegative(),
    })).optional(),
  }).optional(),
});

/**
 * SWOT Schema (gz-swot)
 */
export const SWOTSchema = z.object({
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  opportunities: z.array(z.string()).optional(),
  threats: z.array(z.string()).optional(),
  
  strategies: z.object({
    so: z.array(z.string()).optional(), // Strength-Opportunity
    st: z.array(z.string()).optional(), // Strength-Threat
    wo: z.array(z.string()).optional(), // Weakness-Opportunity
    wt: z.array(z.string()).optional(), // Weakness-Threat
  }).optional(),
});

/**
 * Milestones Schema (gz-meilensteine)
 */
export const MilestonesSchema = z.object({
  milestones: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    targetDate: z.string().optional(),
    status: z.enum(['pending', 'in-progress', 'completed']).optional(),
    dependencies: z.array(z.string()).optional(),
  })).optional(),
  
  phases: z.array(z.object({
    name: z.string(),
    duration: z.string().optional(),
    milestones: z.array(z.string()).optional(),
  })).optional(),
});

/**
 * KPI Schema (gz-kpi)
 */
export const KPISchema = z.object({
  financial: z.array(z.object({
    name: z.string(),
    target: z.number().optional(),
    current: z.number().optional(),
    unit: z.string().optional(),
  })).optional(),
  
  operational: z.array(z.object({
    name: z.string(),
    target: z.number().optional(),
    current: z.number().optional(),
    unit: z.string().optional(),
  })).optional(),
  
  marketing: z.array(z.object({
    name: z.string(),
    target: z.number().optional(),
    current: z.number().optional(),
    unit: z.string().optional(),
  })).optional(),
});

/**
 * Executive Summary Schema (gz-zusammenfassung)
 */
export const ExecutiveSummarySchema = z.object({
  hook: z.string().optional(),
  keyFigures: z.object({
    startupCapital: z.number().optional(),
    year1Revenue: z.number().optional(),
    breakEvenMonth: z.number().optional(),
  }).optional(),
  usp: z.string().optional(),
  market: z.string().optional(),
  team: z.string().optional(),
});

/**
 * Full Workshop Data Schema (combines all modules)
 */
export const WorkshopDataSchema = z.object({
  intake: IntakeModuleSchema.optional(),
  businessModel: BusinessModelSchema.optional(),
  company: CompanySchema.optional(),
  marketCompetition: z.any().optional(), // Complex schema, can be any
  marketing: MarketingSchema.optional(),
  financial: FinancialPlanSchema.optional(),
  swot: SWOTSchema.optional(),
  milestones: MilestonesSchema.optional(),
  kpi: KPISchema.optional(),
  summary: ExecutiveSummarySchema.optional(),
});

/**
 * Type exports
 */
export type IntakeModule = z.infer<typeof IntakeModuleSchema>;
export type BusinessModel = z.infer<typeof BusinessModelSchema>;
export type Company = z.infer<typeof CompanySchema>;
export type FinancialPlan = z.infer<typeof FinancialPlanSchema>;
export type Marketing = z.infer<typeof MarketingSchema>;
export type SWOT = z.infer<typeof SWOTSchema>;
export type Milestones = z.infer<typeof MilestonesSchema>;
export type KPI = z.infer<typeof KPISchema>;
export type ExecutiveSummary = z.infer<typeof ExecutiveSummarySchema>;
export type WorkshopData = z.infer<typeof WorkshopDataSchema>;
