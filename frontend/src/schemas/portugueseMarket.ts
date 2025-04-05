import { z } from 'zod';

// Registry Data Schema
export const registryDataSchema = z.object({
  registryNumber: z.string().min(1),
  propertyType: z.string().min(1),
  location: z.string().min(1),
  registrationDate: z.string().datetime(),
  lastUpdate: z.string().datetime(),
  status: z.enum(['active', 'pending', 'suspended']),
  encumbrances: z.array(
    z.object({
      type: z.enum(['mortgage', 'lien', 'restriction']),
      description: z.string().min(1),
      date: z.string().datetime(),
      status: z.enum(['active', 'resolved']),
    })
  ),
});

// Notary Data Schema
export const notaryDataSchema = z.object({
  notaryId: z.string().min(1),
  documentType: z.enum(['escritura', 'certidão', 'procuração']),
  documentNumber: z.string().min(1),
  date: z.string().datetime(),
  parties: z.array(z.string().min(1)),
  status: z.enum(['valid', 'pending', 'expired']),
  notaryOffice: z.string().min(1),
  value: z.number().positive(),
  currency: z.literal('EUR'),
});

// Energy Certificate Schema
export const energyCertificateSchema = z.object({
  certificateNumber: z.string().min(1),
  energyClass: z.enum(['A+', 'A', 'B', 'C', 'D', 'E', 'F']),
  validUntil: z.string().datetime(),
  energyEfficiency: z.number().min(0).max(100),
  co2Emissions: z.number().min(0),
  primaryEnergy: z.number().min(0),
  globalEnergy: z.number().min(0),
  renewableEnergy: z.number().min(0),
});

// Cadastral Data Schema
export const cadastralDataSchema = z.object({
  cadastralNumber: z.string().min(1),
  propertyType: z.string().min(1),
  area: z.number().positive(),
  location: z.string().min(1),
  lastUpdate: z.string().datetime(),
  constructionYear: z.number().int().min(1800).max(new Date().getFullYear()),
  conservationState: z.enum(['excellent', 'good', 'fair', 'poor']),
  useType: z.string().min(1),
  urbanization: z.enum(['urban', 'rural', 'mixed']),
});

// Tax Data Schema
export const taxDataSchema = z.object({
  propertyTax: z.number().min(0),
  imi: z.number().min(0),
  lastPayment: z.string().datetime(),
  status: z.enum(['up_to_date', 'pending', 'overdue']),
  imt: z.number().min(0),
  stampDuty: z.number().min(0),
  taxExemptions: z.array(
    z.object({
      type: z.string().min(1),
      percentage: z.number().min(0).max(100),
      validUntil: z.string().datetime(),
    })
  ),
});

// Urban Planning Schema
export const urbanPlanningSchema = z.object({
  licenseNumber: z.string().min(1),
  type: z.enum(['construction', 'renovation', 'demolition']),
  status: z.enum(['valid', 'expired', 'pending']),
  issueDate: z.string().datetime(),
  expiryDate: z.string().datetime(),
  restrictions: z.array(z.string().min(1)),
});

// Condominium Schema
export const condominiumSchema = z.object({
  exists: z.boolean(),
  name: z.string().min(1).optional(),
  number: z.string().min(1).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  lastAssemblyDate: z.string().datetime().optional(),
  nextAssemblyDate: z.string().datetime().optional(),
  maintenanceFund: z.number().min(0).optional(),
});

// Compliance Data Schema
export const complianceDataSchema = z.object({
  registryData: registryDataSchema,
  notaryData: notaryDataSchema,
  cadastralData: cadastralDataSchema,
  taxData: taxDataSchema,
  energyCertificate: energyCertificateSchema,
  urbanPlanning: urbanPlanningSchema,
  condominium: condominiumSchema,
});

// Market Requirements Schema
export const marketRequirementsSchema = z.object({
  requiredDocuments: z.array(z.string().min(1)),
  complianceChecks: z.object({
    registry: z.boolean(),
    notary: z.boolean(),
    cadastral: z.boolean(),
    tax: z.boolean(),
    energy: z.boolean(),
    urbanPlanning: z.boolean(),
    condominium: z.boolean(),
  }),
  deadlines: z.object({
    documentSubmission: z.string().datetime(),
    complianceCheck: z.string().datetime(),
  }),
  regionalRequirements: z.array(
    z.object({
      region: z.string().min(1),
      additionalDocuments: z.array(z.string().min(1)),
      specificChecks: z.array(z.string().min(1)),
    })
  ),
});

// AI Analysis Schema
export const aiAnalysisSchema = z.object({
  riskScore: z.number().min(0).max(100),
  recommendations: z.array(z.string().min(1)),
  marketInsights: z.object({
    trend: z.enum(['positive', 'neutral', 'negative']),
    confidence: z.number().min(0).max(1),
    factors: z.array(z.string().min(1)),
  }),
  complianceScore: z.number().min(0).max(100),
  issues: z.array(
    z.object({
      severity: z.enum(['high', 'medium', 'low']),
      description: z.string().min(1),
      impact: z.string().min(1),
      resolution: z.string().min(1),
    })
  ),
});

// Export types derived from schemas
export type RegistryData = z.infer<typeof registryDataSchema>;
export type NotaryData = z.infer<typeof notaryDataSchema>;
export type EnergyCertificate = z.infer<typeof energyCertificateSchema>;
export type CadastralData = z.infer<typeof cadastralDataSchema>;
export type TaxData = z.infer<typeof taxDataSchema>;
export type UrbanPlanning = z.infer<typeof urbanPlanningSchema>;
export type Condominium = z.infer<typeof condominiumSchema>;
export type ComplianceData = z.infer<typeof complianceDataSchema>;
export type MarketRequirements = z.infer<typeof marketRequirementsSchema>;
export type AIAnalysisResult = z.infer<typeof aiAnalysisSchema>; 