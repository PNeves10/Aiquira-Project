import type { Meta, StoryObj } from '@storybook/react';
import { AssetCard } from './AssetCard';
import { toast } from 'react-hot-toast';

const meta: Meta<typeof AssetCard> = {
  title: 'Components/AssetCard',
  component: AssetCard,
  parameters: {
    layout: 'centered',
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AssetCard>;

const mockAsset = {
  id: '1',
  title: 'Premium Office Space',
  description: 'Modern office space in downtown area with excellent amenities and parking.',
  price: 2500000,
  location: 'New York, NY',
  type: 'Commercial',
  status: 'Available',
  imageUrl: 'https://example.com/office.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const Default: Story = {
  args: {
    asset: mockAsset,
  },
};

export const Loading: Story = {
  args: {
    asset: mockAsset,
    isLoading: true,
  },
};

export const WithLongDescription: Story = {
  args: {
    asset: {
      ...mockAsset,
      description: 'This is a very long description that should wrap properly and maintain readability. It contains multiple sentences and should demonstrate how the component handles extended content while maintaining accessibility and visual appeal.',
    },
  },
};

export const HighValue: Story = {
  args: {
    asset: {
      ...mockAsset,
      title: 'Luxury Estate',
      price: 15000000,
      location: 'Beverly Hills, CA',
      type: 'Residential',
      description: 'Stunning luxury estate with panoramic views and world-class amenities.',
    },
  },
};

export const WithCallbacks: Story = {
  args: {
    asset: mockAsset,
    onViewDetails: (id) => toast.success(`View details clicked for asset: ${id}`),
    onContact: (id) => toast.success(`Contact clicked for asset: ${id}`),
    onUpdateStatus: async (id, newStatus) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Status updated to ${newStatus}`);
    },
  },
};

export const ErrorState: Story = {
  args: {
    asset: mockAsset,
    onUpdateStatus: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      throw new Error('Failed to update status');
    },
  },
}; 