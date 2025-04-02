import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import MainLayout from '@/components/layout/MainLayout';
import { Tab } from '@headlessui/react';

// Types
interface AssetDetails {
  id: number;
  title: string;
  type: string;
  price: string;
  status: string;
  description: string;
  location: string;
  financials: {
    revenue: string;
    profit: string;
    employees: number;
    yearFounded: number;
  };
  documents: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
  aiAnalysis: {
    valuation: {
      value: string;
      confidence: number;
      factors: string[];
    };
    risks: {
      level: 'low' | 'medium' | 'high';
      items: string[];
    };
    opportunities: string[];
  };
}

export default function AssetDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useTranslation('common');
  const [asset, setAsset] = useState<AssetDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssetDetails = async () => {
      try {
        const response = await fetch(`/api/assets/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch asset details');
        }
        const data = await response.json();
        setAsset(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAssetDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !asset) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error || 'Asset not found'}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{asset.title}</h1>
              <p className="mt-2 text-lg text-gray-500">{asset.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              asset.status === 'Available' ? 'bg-green-100 text-green-800' :
              asset.status === 'Under Offer' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {asset.status}
            </span>
          </div>
          <div className="mt-4 flex items-center space-x-4">
            <span className="text-2xl font-bold text-primary-600">{asset.price}</span>
            <span className="text-gray-500">{asset.location}</span>
          </div>
        </div>

        {/* Tabs */}
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1">
            <Tab className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected
                ? 'bg-white text-primary-600 shadow'
                : 'text-gray-700 hover:bg-white/[0.12] hover:text-primary-600'
              }`
            }>
              Overview
            </Tab>
            <Tab className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected
                ? 'bg-white text-primary-600 shadow'
                : 'text-gray-700 hover:bg-white/[0.12] hover:text-primary-600'
              }`
            }>
              Financials
            </Tab>
            <Tab className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected
                ? 'bg-white text-primary-600 shadow'
                : 'text-gray-700 hover:bg-white/[0.12] hover:text-primary-600'
              }`
            }>
              Documents
            </Tab>
            <Tab className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected
                ? 'bg-white text-primary-600 shadow'
                : 'text-gray-700 hover:bg-white/[0.12] hover:text-primary-600'
              }`
            }>
              AI Analysis
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-6">
            {/* Overview Panel */}
            <Tab.Panel className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Type</h3>
                  <p className="mt-1 text-lg">{asset.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="mt-1 text-lg">{asset.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Price</h3>
                  <p className="mt-1 text-lg">{asset.price}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="mt-1 text-lg">{asset.status}</p>
                </div>
              </div>
            </Tab.Panel>

            {/* Financials Panel */}
            <Tab.Panel className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">Financial Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Annual Revenue</h3>
                  <p className="mt-1 text-lg">{asset.financials.revenue}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Annual Profit</h3>
                  <p className="mt-1 text-lg">{asset.financials.profit}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Number of Employees</h3>
                  <p className="mt-1 text-lg">{asset.financials.employees}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Year Founded</h3>
                  <p className="mt-1 text-lg">{asset.financials.yearFounded}</p>
                </div>
              </div>
            </Tab.Panel>

            {/* Documents Panel */}
            <Tab.Panel className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">Documents</h2>
              <div className="space-y-4">
                {asset.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{doc.name}</h3>
                      <p className="text-sm text-gray-500">{doc.type}</p>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </Tab.Panel>

            {/* AI Analysis Panel */}
            <Tab.Panel className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">AI Analysis</h2>
              
              {/* Valuation */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-2">Valuation Analysis</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-primary-600">
                      {asset.aiAnalysis.valuation.value}
                    </span>
                    <span className="text-sm text-gray-500">
                      Confidence: {asset.aiAnalysis.valuation.confidence}%
                    </span>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Key Factors</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {asset.aiAnalysis.valuation.factors.map((factor, index) => (
                        <li key={index} className="text-sm text-gray-600">{factor}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Risks */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-2">Risk Assessment</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      asset.aiAnalysis.risks.level === 'low' ? 'bg-green-100 text-green-800' :
                      asset.aiAnalysis.risks.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {asset.aiAnalysis.risks.level.toUpperCase()} Risk
                    </span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 mt-4">
                    {asset.aiAnalysis.risks.items.map((risk, index) => (
                      <li key={index} className="text-sm text-gray-600">{risk}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Opportunities */}
              <div>
                <h3 className="text-lg font-medium mb-2">Growth Opportunities</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="list-disc list-inside space-y-1">
                    {asset.aiAnalysis.opportunities.map((opportunity, index) => (
                      <li key={index} className="text-sm text-gray-600">{opportunity}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </MainLayout>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
} 