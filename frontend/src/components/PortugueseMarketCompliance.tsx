import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { portugueseMarketService, PortugueseComplianceData, PortugueseMarketRequirements } from '../services/portugueseMarket';
import { captureError } from '../utils/sentry';

interface PortugueseMarketComplianceProps {
  assetId: string;
}

interface ErrorState {
  message: string;
  code?: string;
  details?: string;
}

const ComplianceSection: React.FC<{
  title: string;
  children: React.ReactNode;
  id?: string;
}> = React.memo(({ title, children, id }) => (
  <section 
    className="mb-6" 
    id={id}
    aria-labelledby={`${id}-title`}
  >
    <h3 id={`${id}-title`} className="text-lg font-medium mb-2">{title}</h3>
    {children}
  </section>
));

const StatusBadge: React.FC<{
  status: string;
  type: 'success' | 'warning' | 'error';
  ariaLabel?: string;
}> = React.memo(({ status, type, ariaLabel }) => {
  const styles = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <span 
      className={`inline-block px-2 py-1 rounded-full text-sm ${styles[type]}`}
      role="status"
      aria-label={ariaLabel || `${status} status`}
    >
      {status}
    </span>
  );
});

export const PortugueseMarketCompliance: React.FC<PortugueseMarketComplianceProps> = React.memo(({ assetId }) => {
  const [complianceData, setComplianceData] = useState<PortugueseComplianceData | null>(null);
  const [requirements, setRequirements] = useState<PortugueseMarketRequirements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [compliance, marketRequirements] = await Promise.all([
        portugueseMarketService.getComplianceData(assetId),
        portugueseMarketService.getMarketRequirements(),
      ]);
      setComplianceData(compliance);
      setRequirements(marketRequirements);
    } catch (err) {
      const errorState: ErrorState = {
        message: err instanceof Error ? err.message : 'Failed to fetch compliance data',
        code: err instanceof Error && 'code' in err ? (err as any).code : undefined,
        details: err instanceof Error ? err.stack : undefined,
      };
      setError(errorState);
      captureError(err instanceof Error ? err : new Error(errorState.message));
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formattedDates = useMemo(() => {
    if (!complianceData) return {};
    return {
      energyCertificate: new Date(complianceData.energyCertificate.validUntil).toLocaleDateString(),
      lastPayment: new Date(complianceData.taxData.lastPayment).toLocaleDateString(),
      lastAssembly: new Date(complianceData.condominium.lastAssemblyDate).toLocaleDateString(),
      nextAssembly: new Date(complianceData.condominium.nextAssemblyDate).toLocaleDateString(),
    };
  }, [complianceData]);

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center p-8"
        role="status"
        aria-label="Loading compliance data"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="p-4 bg-red-50 text-red-700 rounded-lg"
        role="alert"
        aria-live="polite"
      >
        <h3 className="font-semibold mb-2">Error Loading Compliance Data</h3>
        <p>{error.message}</p>
        {error.code && <p className="text-sm mt-1">Error Code: {error.code}</p>}
        {error.details && (
          <details className="mt-2 text-sm">
            <summary>Technical Details</summary>
            <pre className="mt-1 whitespace-pre-wrap">{error.details}</pre>
          </details>
        )}
      </div>
    );
  }

  if (!complianceData || !requirements) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      role="region"
      aria-label="Portuguese Market Compliance Information"
    >
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Portuguese Market Compliance</h2>
        
        <nav aria-label="Compliance sections">
          <ul className="flex flex-wrap gap-2 mb-4">
            {['registry', 'notary', 'cadastral', 'energy', 'tax', 'urban', 'condominium'].map((section) => (
              <li key={section}>
                <a
                  href={`#${section}-section`}
                  className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Registry Information */}
        <ComplianceSection title="Registry Information" id="registry-section">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Registry Number</p>
              <p className="font-medium">{complianceData.registryData.registryNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <StatusBadge 
                status={complianceData.registryData.status} 
                type={
                  complianceData.registryData.status === 'active' ? 'success' :
                  complianceData.registryData.status === 'pending' ? 'warning' :
                  'error'
                }
                ariaLabel={`Registry status: ${complianceData.registryData.status}`}
              />
            </div>
          </div>
          {complianceData.registryData.encumbrances.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Encumbrances</p>
              <ul className="space-y-2">
                {complianceData.registryData.encumbrances.map((encumbrance, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {encumbrance.type} - {encumbrance.description}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      encumbrance.status === 'active' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {encumbrance.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ComplianceSection>

        {/* Notary Documents */}
        <ComplianceSection title="Notary Documents" id="notary-section">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{complianceData.notaryData.documentType}</p>
                <p className="text-sm text-gray-600">Document Number: {complianceData.notaryData.documentNumber}</p>
                <p className="text-sm text-gray-600">Notary Office: {complianceData.notaryData.notaryOffice}</p>
                <p className="text-sm text-gray-600">Value: {complianceData.notaryData.value.toLocaleString()} {complianceData.notaryData.currency}</p>
              </div>
              <StatusBadge status={complianceData.notaryData.status} type={
                complianceData.notaryData.status === 'valid' ? 'success' :
                complianceData.notaryData.status === 'pending' ? 'warning' :
                'error'
              } />
            </div>
          </div>
        </ComplianceSection>

        {/* Cadastral Information */}
        <ComplianceSection title="Cadastral Information" id="cadastral-section">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Cadastral Number</p>
              <p className="font-medium">{complianceData.cadastralData.cadastralNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Area</p>
              <p className="font-medium">{complianceData.cadastralData.area} m²</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Construction Year</p>
              <p className="font-medium">{complianceData.cadastralData.constructionYear}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Conservation State</p>
              <StatusBadge status={complianceData.cadastralData.conservationState} type={
                complianceData.cadastralData.conservationState === 'excellent' ? 'success' :
                complianceData.cadastralData.conservationState === 'good' ? 'success' :
                complianceData.cadastralData.conservationState === 'fair' ? 'warning' :
                'error'
              } />
            </div>
          </div>
        </ComplianceSection>

        {/* Energy Certificate */}
        <ComplianceSection title="Energy Certificate" id="energy-section">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Certificate Number</p>
              <p className="font-medium">{complianceData.energyCertificate.certificateNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Energy Class</p>
              <StatusBadge status={complianceData.energyCertificate.energyClass} type={
                complianceData.energyCertificate.energyClass === 'A+' ? 'success' :
                complianceData.energyCertificate.energyClass === 'A' ? 'success' :
                complianceData.energyCertificate.energyClass === 'B' ? 'success' :
                complianceData.energyCertificate.energyClass === 'C' ? 'warning' :
                'error'
              } />
            </div>
            <div>
              <p className="text-sm text-gray-600">Valid Until</p>
              <p className="font-medium">{formattedDates.energyCertificate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Energy Efficiency</p>
              <p className="font-medium">{complianceData.energyCertificate.energyEfficiency} kWh/m²/year</p>
            </div>
          </div>
        </ComplianceSection>

        {/* Tax Information */}
        <ComplianceSection title="Tax Information" id="tax-section">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">IMI Status</p>
              <StatusBadge status={complianceData.taxData.status} type={
                complianceData.taxData.status === 'up_to_date' ? 'success' :
                complianceData.taxData.status === 'pending' ? 'warning' :
                'error'
              } />
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Payment</p>
              <p className="font-medium">{formattedDates.lastPayment}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">IMT</p>
              <p className="font-medium">{complianceData.taxData.imt.toLocaleString()} €</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Stamp Duty</p>
              <p className="font-medium">{complianceData.taxData.stampDuty.toLocaleString()} €</p>
            </div>
          </div>
          {complianceData.taxData.taxExemptions.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Tax Exemptions</p>
              <ul className="space-y-2">
                {complianceData.taxData.taxExemptions.map((exemption, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {exemption.type} - {exemption.percentage}% until {new Date(exemption.validUntil).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ComplianceSection>

        {/* Urban Planning */}
        <ComplianceSection title="Urban Planning" id="urban-section">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">License Number</p>
              <p className="font-medium">{complianceData.urbanPlanning.licenseNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <StatusBadge status={complianceData.urbanPlanning.status} type={
                complianceData.urbanPlanning.status === 'valid' ? 'success' :
                complianceData.urbanPlanning.status === 'pending' ? 'warning' :
                'error'
              } />
            </div>
          </div>
          {complianceData.urbanPlanning.restrictions.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Restrictions</p>
              <ul className="space-y-2">
                {complianceData.urbanPlanning.restrictions.map((restriction, index) => (
                  <li key={index} className="text-sm text-gray-600">{restriction}</li>
                ))}
              </ul>
            </div>
          )}
        </ComplianceSection>

        {/* Condominium Information */}
        {complianceData.condominium.exists && (
          <ComplianceSection title="Condominium Information" id="condominium-section">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{complianceData.condominium.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Number</p>
                <p className="font-medium">{complianceData.condominium.number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <StatusBadge status={complianceData.condominium.status} type={
                  complianceData.condominium.status === 'active' ? 'success' : 'error'
                } />
              </div>
              <div>
                <p className="text-sm text-gray-600">Maintenance Fund</p>
                <p className="font-medium">{complianceData.condominium.maintenanceFund.toLocaleString()} €</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Last Assembly</p>
                <p className="font-medium">{formattedDates.lastAssembly}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Assembly</p>
                <p className="font-medium">{formattedDates.nextAssembly}</p>
              </div>
            </div>
          </ComplianceSection>
        )}

        {/* Required Documents */}
        <ComplianceSection title="Required Documents" id="required-documents-section">
          <ul className="list-disc list-inside space-y-1">
            {requirements.requiredDocuments.map((doc, index) => (
              <li key={index} className="text-sm text-gray-600">{doc}</li>
            ))}
          </ul>
        </ComplianceSection>
      </div>
    </motion.div>
  );
}); 