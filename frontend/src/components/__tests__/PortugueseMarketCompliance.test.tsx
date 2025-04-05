import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { PortugueseMarketCompliance } from '../PortugueseMarketCompliance';
import { portugueseMarketService } from '../../services/portugueseMarket';

// Mock the portugueseMarketService
jest.mock('../../services/portugueseMarket', () => ({
  portugueseMarketService: {
    getComplianceData: jest.fn(),
    getMarketRequirements: jest.fn(),
  },
}));

describe('PortugueseMarketCompliance', () => {
  const mockAssetId = 'test-asset-id';
  const mockComplianceData = {
    registryData: {
      registryNumber: 'REG123',
      propertyType: 'Residential',
      location: 'Lisbon',
      registrationDate: '2023-01-01',
      lastUpdate: '2023-12-31',
      status: 'active' as const,
      encumbrances: [
        {
          type: 'mortgage' as const,
          description: 'Bank Loan',
          date: '2023-01-01',
          status: 'active' as const,
        },
      ],
    },
    notaryData: {
      notaryId: 'NOT123',
      documentType: 'escritura' as const,
      documentNumber: 'DOC456',
      date: '2023-01-01',
      parties: ['Seller', 'Buyer'],
      status: 'valid' as const,
      notaryOffice: 'Lisbon Notary Office',
      value: 500000,
      currency: 'EUR' as const,
    },
    cadastralData: {
      cadastralNumber: 'CAD789',
      propertyType: 'Apartment',
      area: 100,
      location: 'Lisbon',
      lastUpdate: '2023-12-31',
      constructionYear: 2020,
      conservationState: 'excellent' as const,
      useType: 'Residential',
      urbanization: 'urban' as const,
    },
    taxData: {
      propertyTax: 1000,
      imi: 500,
      lastPayment: '2023-12-31',
      status: 'up_to_date' as const,
      imt: 25000,
      stampDuty: 5000,
      taxExemptions: [
        {
          type: 'IMI Exemption',
          percentage: 100,
          validUntil: '2024-12-31',
        },
      ],
    },
    energyCertificate: {
      certificateNumber: 'EC123',
      energyClass: 'A+' as const,
      validUntil: '2024-12-31',
      energyEfficiency: 50,
      co2Emissions: 20,
      primaryEnergy: 100,
      globalEnergy: 80,
      renewableEnergy: 30,
    },
    urbanPlanning: {
      licenseNumber: 'UP123',
      type: 'construction' as const,
      status: 'valid' as const,
      issueDate: '2023-01-01',
      expiryDate: '2024-12-31',
      restrictions: ['Protected Area', 'Height Limit'],
    },
    condominium: {
      exists: true,
      name: 'Residencial Sol',
      number: 'COND123',
      status: 'active' as const,
      lastAssemblyDate: '2023-12-01',
      nextAssemblyDate: '2024-06-01',
      maintenanceFund: 50000,
    },
  };

  const mockRequirements = {
    requiredDocuments: [
      'Property Registry Certificate',
      'Notary Deed',
      'Cadastral Certificate',
      'IMI Payment Receipt',
      'Energy Certificate',
      'Urban Planning License',
      'Condominium Certificate',
    ],
    complianceChecks: {
      registry: true,
      notary: true,
      cadastral: true,
      tax: true,
      energy: true,
      urbanPlanning: true,
      condominium: true,
    },
    deadlines: {
      documentSubmission: '2024-03-31',
      complianceCheck: '2024-04-30',
    },
    regionalRequirements: [
      {
        region: 'Lisbon',
        additionalDocuments: ['Lisbon City Council Certificate'],
        specificChecks: ['Historical Building Protection'],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<PortugueseMarketCompliance assetId={mockAssetId} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders error state when API call fails', async () => {
    const errorMessage = 'Failed to fetch data';
    (portugueseMarketService.getComplianceData as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    render(<PortugueseMarketCompliance assetId={mockAssetId} />);

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  it('renders compliance data successfully', async () => {
    (portugueseMarketService.getComplianceData as jest.Mock).mockResolvedValueOnce(mockComplianceData);
    (portugueseMarketService.getMarketRequirements as jest.Mock).mockResolvedValueOnce(mockRequirements);

    render(<PortugueseMarketCompliance assetId={mockAssetId} />);

    await waitFor(() => {
      expect(screen.getByText('Portuguese Market Compliance')).toBeInTheDocument();
      expect(screen.getByText('Registry Information')).toBeInTheDocument();
      expect(screen.getByText('Notary Documents')).toBeInTheDocument();
      expect(screen.getByText('Cadastral Information')).toBeInTheDocument();
      expect(screen.getByText('Energy Certificate')).toBeInTheDocument();
      expect(screen.getByText('Tax Information')).toBeInTheDocument();
      expect(screen.getByText('Urban Planning')).toBeInTheDocument();
      expect(screen.getByText('Condominium Information')).toBeInTheDocument();
      expect(screen.getByText('Required Documents')).toBeInTheDocument();
    });
  });

  it('displays registry encumbrances', async () => {
    (portugueseMarketService.getComplianceData as jest.Mock).mockResolvedValueOnce(mockComplianceData);
    (portugueseMarketService.getMarketRequirements as jest.Mock).mockResolvedValueOnce(mockRequirements);

    render(<PortugueseMarketCompliance assetId={mockAssetId} />);

    await waitFor(() => {
      expect(screen.getByText('Encumbrances')).toBeInTheDocument();
      expect(screen.getByText('mortgage')).toBeInTheDocument();
      expect(screen.getByText('Bank Loan')).toBeInTheDocument();
    });
  });

  it('displays notary office and value information', async () => {
    (portugueseMarketService.getComplianceData as jest.Mock).mockResolvedValueOnce(mockComplianceData);
    (portugueseMarketService.getMarketRequirements as jest.Mock).mockResolvedValueOnce(mockRequirements);

    render(<PortugueseMarketCompliance assetId={mockAssetId} />);

    await waitFor(() => {
      expect(screen.getByText('Lisbon Notary Office')).toBeInTheDocument();
      expect(screen.getByText('500,000 EUR')).toBeInTheDocument();
    });
  });

  it('displays cadastral construction details', async () => {
    (portugueseMarketService.getComplianceData as jest.Mock).mockResolvedValueOnce(mockComplianceData);
    (portugueseMarketService.getMarketRequirements as jest.Mock).mockResolvedValueOnce(mockRequirements);

    render(<PortugueseMarketCompliance assetId={mockAssetId} />);

    await waitFor(() => {
      expect(screen.getByText('2020')).toBeInTheDocument();
      expect(screen.getByText('excellent')).toBeInTheDocument();
    });
  });

  it('displays energy certificate information', async () => {
    (portugueseMarketService.getComplianceData as jest.Mock).mockResolvedValueOnce(mockComplianceData);
    (portugueseMarketService.getMarketRequirements as jest.Mock).mockResolvedValueOnce(mockRequirements);

    render(<PortugueseMarketCompliance assetId={mockAssetId} />);

    await waitFor(() => {
      expect(screen.getByText('EC123')).toBeInTheDocument();
      expect(screen.getByText('A+')).toBeInTheDocument();
      expect(screen.getByText('50 kWh/m²/year')).toBeInTheDocument();
    });
  });

  it('displays tax exemptions', async () => {
    (portugueseMarketService.getComplianceData as jest.Mock).mockResolvedValueOnce(mockComplianceData);
    (portugueseMarketService.getMarketRequirements as jest.Mock).mockResolvedValueOnce(mockRequirements);

    render(<PortugueseMarketCompliance assetId={mockAssetId} />);

    await waitFor(() => {
      expect(screen.getByText('Tax Exemptions')).toBeInTheDocument();
      expect(screen.getByText('IMI Exemption')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  it('displays urban planning restrictions', async () => {
    (portugueseMarketService.getComplianceData as jest.Mock).mockResolvedValueOnce(mockComplianceData);
    (portugueseMarketService.getMarketRequirements as jest.Mock).mockResolvedValueOnce(mockRequirements);

    render(<PortugueseMarketCompliance assetId={mockAssetId} />);

    await waitFor(() => {
      expect(screen.getByText('Restrictions')).toBeInTheDocument();
      expect(screen.getByText('Protected Area')).toBeInTheDocument();
      expect(screen.getByText('Height Limit')).toBeInTheDocument();
    });
  });

  it('displays condominium information when exists', async () => {
    (portugueseMarketService.getComplianceData as jest.Mock).mockResolvedValueOnce(mockComplianceData);
    (portugueseMarketService.getMarketRequirements as jest.Mock).mockResolvedValueOnce(mockRequirements);

    render(<PortugueseMarketCompliance assetId={mockAssetId} />);

    await waitFor(() => {
      expect(screen.getByText('Residencial Sol')).toBeInTheDocument();
      expect(screen.getByText('COND123')).toBeInTheDocument();
      expect(screen.getByText('50,000 €')).toBeInTheDocument();
    });
  });

  it('does not display condominium information when it does not exist', async () => {
    const dataWithoutCondominium = {
      ...mockComplianceData,
      condominium: {
        ...mockComplianceData.condominium,
        exists: false,
      },
    };

    (portugueseMarketService.getComplianceData as jest.Mock).mockResolvedValueOnce(dataWithoutCondominium);
    (portugueseMarketService.getMarketRequirements as jest.Mock).mockResolvedValueOnce(mockRequirements);

    render(<PortugueseMarketCompliance assetId={mockAssetId} />);

    await waitFor(() => {
      expect(screen.queryByText('Condominium Information')).not.toBeInTheDocument();
    });
  });
}); 