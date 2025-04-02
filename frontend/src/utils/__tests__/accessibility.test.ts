import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { axeTest, checkKeyboardNavigation, checkARIACompliance } from '../accessibility';

expect.extend(toHaveNoViolations);

describe('Accessibility Utilities', () => {
  describe('axeTest', () => {
    it('should detect accessibility violations', async () => {
      const { container } = render(
        <button style={{ color: '#fff', backgroundColor: '#fff' }}>
          Low contrast button
        </button>
      );
      
      const results = await axe(container);
      expect(results.violations.length).toBeGreaterThan(0);
    });

    it('should pass when component is accessible', async () => {
      const { container } = render(
        <button style={{ color: '#000', backgroundColor: '#fff' }}>
          High contrast button
        </button>
      );
      
      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });
  });

  describe('checkKeyboardNavigation', () => {
    it('should verify keyboard navigation works', async () => {
      const { container } = render(
        <div>
          <button>First</button>
          <button>Second</button>
          <button>Third</button>
        </div>
      );

      const result = await checkKeyboardNavigation(container);
      expect(result).toBe(true);
    });

    it('should detect keyboard navigation issues', async () => {
      const { container } = render(
        <div>
          <button tabIndex={-1}>Unreachable</button>
          <button>Reachable</button>
        </div>
      );

      const result = await checkKeyboardNavigation(container);
      expect(result).toBe(false);
    });
  });

  describe('checkARIACompliance', () => {
    it('should verify ARIA attributes are correct', () => {
      const { container } = render(
        <div>
          <button aria-label="Close">×</button>
          <div role="dialog" aria-labelledby="dialog-title">
            <h2 id="dialog-title">Dialog Title</h2>
          </div>
        </div>
      );

      const result = checkARIACompliance(container);
      expect(result).toBe(true);
    });

    it('should detect missing required ARIA attributes', () => {
      const { container } = render(
        <div>
          <button>Missing aria-label</button>
          <div role="dialog">
            <h2>Missing aria-labelledby</h2>
          </div>
        </div>
      );

      const result = checkARIACompliance(container);
      expect(result).toBe(false);
    });
  });
}); 