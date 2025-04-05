import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A reusable tooltip component that displays additional information on hover or focus. Supports multiple positions and includes accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    children: <button className="px-4 py-2 bg-blue-500 text-white rounded">Hover me</button>,
  },
};

export const TopPosition: Story = {
  args: {
    content: 'Tooltip on top',
    position: 'top',
    children: <button className="px-4 py-2 bg-blue-500 text-white rounded">Hover me</button>,
  },
};

export const BottomPosition: Story = {
  args: {
    content: 'Tooltip on bottom',
    position: 'bottom',
    children: <button className="px-4 py-2 bg-blue-500 text-white rounded">Hover me</button>,
  },
};

export const LeftPosition: Story = {
  args: {
    content: 'Tooltip on left',
    position: 'left',
    children: <button className="px-4 py-2 bg-blue-500 text-white rounded">Hover me</button>,
  },
};

export const RightPosition: Story = {
  args: {
    content: 'Tooltip on right',
    position: 'right',
    children: <button className="px-4 py-2 bg-blue-500 text-white rounded">Hover me</button>,
  },
};

export const WithLongContent: Story = {
  args: {
    content: 'This is a longer tooltip that contains more detailed information about the element being hovered.',
    children: <button className="px-4 py-2 bg-blue-500 text-white rounded">Hover me</button>,
  },
};

export const WithCustomElement: Story = {
  args: {
    content: 'Tooltip with custom element',
    children: (
      <div className="flex items-center space-x-2">
        <span className="text-gray-600">Custom Element</span>
        <span className="text-blue-500">(hover me)</span>
      </div>
    ),
  },
}; 