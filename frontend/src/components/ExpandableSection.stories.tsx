import type { Meta, StoryObj } from '@storybook/react';
import { ExpandableSection } from './ExpandableSection';

const meta: Meta<typeof ExpandableSection> = {
  title: 'Components/ExpandableSection',
  component: ExpandableSection,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A collapsible section component with smooth animations and accessibility features. Supports default expanded state and custom styling.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ExpandableSection>;

export const Default: Story = {
  args: {
    title: 'Section Title',
    children: <p className="text-gray-600">This is the content that will be shown when the section is expanded.</p>,
  },
};

export const DefaultExpanded: Story = {
  args: {
    title: 'Pre-expanded Section',
    defaultExpanded: true,
    children: <p className="text-gray-600">This section is expanded by default.</p>,
  },
};

export const WithListContent: Story = {
  args: {
    title: 'List Section',
    children: (
      <ul className="space-y-2">
        <li className="text-gray-600">• First item</li>
        <li className="text-gray-600">• Second item</li>
        <li className="text-gray-600">• Third item</li>
      </ul>
    ),
  },
};

export const WithCustomStyling: Story = {
  args: {
    title: 'Custom Styled Section',
    className: 'border-blue-500',
    children: (
      <div className="p-4 bg-blue-50 rounded">
        <p className="text-blue-700">This section has custom styling applied.</p>
      </div>
    ),
  },
};

export const WithComplexContent: Story = {
  args: {
    title: 'Complex Content Section',
    children: (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Subtitle</h3>
        <p className="text-gray-600">
          This section contains multiple elements including headings, paragraphs, and interactive elements.
        </p>
        <div className="flex space-x-4">
          <button className="px-3 py-1 bg-blue-500 text-white rounded">Action 1</button>
          <button className="px-3 py-1 bg-gray-500 text-white rounded">Action 2</button>
        </div>
      </div>
    ),
  },
}; 