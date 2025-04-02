import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssetCard } from '../AssetCard';
import { axeTest, checkKeyboardNavigation, checkARIACompliance } from '../../utils/accessibility';

const mockAsset = {
  id: '1',
  title: 'Test Asset',
  description: 'Test Description',
  price: 100000,
  location: 'Test Location',
  type: 'Business',
  status: 'Available',
  imageUrl: 'https://example.com/image.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('AssetCard Accessibility', () => {
  it('should have no accessibility violations', async () => {
    await axeTest(<AssetCard asset={mockAsset} />);
  });

  it('should support keyboard navigation', async () => {
    await checkKeyboardNavigation(<AssetCard asset={mockAsset} />);
  });

  it('should have proper ARIA attributes', () => {
    checkARIACompliance(<AssetCard asset={mockAsset} />);
  });

  it('should announce status changes to screen readers', async () => {
    const { container } = render(<AssetCard asset={mockAsset} />);
    const statusElement = container.querySelector('[aria-live]');
    expect(statusElement).toHaveAttribute('aria-live', 'polite');
    expect(statusElement).toHaveAttribute('role', 'status');
  });

  it('should have proper focus management', async () => {
    const { container } = render(<AssetCard asset={mockAsset} />);
    const card = container.firstChild as HTMLElement;
    
    // Focus the card
    card.focus();
    expect(card).toHaveFocus();
    
    // Check if focus is trapped within the card
    const focusableElements = card.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    // Tab through all focusable elements
    for (const element of focusableElements) {
      element.focus();
      expect(element).toHaveFocus();
    }
  });

  it('should handle keyboard interactions properly', async () => {
    const onViewDetails = jest.fn();
    const onContact = jest.fn();
    
    render(
      <AssetCard
        asset={mockAsset}
        onViewDetails={onViewDetails}
        onContact={onContact}
      />
    );

    const viewDetailsButton = screen.getByRole('button', { name: /view details/i });
    const contactButton = screen.getByRole('button', { name: /contact/i });

    // Test Enter key
    viewDetailsButton.focus();
    await userEvent.keyboard('{Enter}');
    expect(onViewDetails).toHaveBeenCalled();

    // Test Space key
    contactButton.focus();
    await userEvent.keyboard(' ');
    expect(onContact).toHaveBeenCalled();
  });

  it('should have proper image alt text', () => {
    const { container } = render(<AssetCard asset={mockAsset} />);
    const image = container.querySelector('img');
    expect(image).toHaveAttribute('alt', `Image of ${mockAsset.title}`);
  });

  it('should maintain proper heading hierarchy', () => {
    const { container } = render(<AssetCard asset={mockAsset} />);
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    expect(headings.length).toBeGreaterThan(0);
    
    // Check if headings are properly nested
    let previousLevel = 0;
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName[1]);
      expect(level - previousLevel).toBeLessThanOrEqual(1);
      previousLevel = level;
    });
  });
}); 