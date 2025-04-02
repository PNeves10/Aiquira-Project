import { axe, toHaveNoViolations } from 'jest-axe';
import { ReactElement } from 'react';
import { render } from '@testing-library/react';

expect.extend(toHaveNoViolations);

export const axeTest = async (component: ReactElement) => {
  const { container } = render(component);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

export const checkKeyboardNavigation = async (component: ReactElement): Promise<boolean> => {
  const { container } = render(component);
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  try {
    // Focus each element in sequence
    for (const element of focusableElements) {
      (element as HTMLElement).focus();
      if (!document.activeElement?.isSameNode(element)) {
        return false;
      }
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const checkScreenReaderAnnouncements = async (component: React.ReactElement) => {
  const { container } = render(component);
  const announcements = container.querySelectorAll('[aria-live]');
  
  announcements.forEach((element) => {
    expect(element).toHaveAttribute('aria-live');
    expect(element).toHaveAttribute('role', 'status');
  });
};

export const checkARIACompliance = (component: ReactElement): boolean => {
  const { container } = render(component);
  
  // Check for required ARIA attributes
  const elementsWithRole = container.querySelectorAll('[role]');
  for (const element of elementsWithRole) {
    const role = element.getAttribute('role');
    
    // Check for required attributes based on role
    switch (role) {
      case 'dialog':
        if (!element.hasAttribute('aria-labelledby')) {
          return false;
        }
        break;
      case 'button':
        if (!element.hasAttribute('aria-label') && !element.textContent) {
          return false;
        }
        break;
      case 'img':
        if (!element.hasAttribute('alt')) {
          return false;
        }
        break;
    }
  }

  // Check for proper ARIA relationships
  const elementsWithAriaLabelledby = container.querySelectorAll('[aria-labelledby]');
  for (const element of elementsWithAriaLabelledby) {
    const labelledby = element.getAttribute('aria-labelledby');
    if (labelledby) {
      const labelElement = container.querySelector(`#${labelledby}`);
      if (!labelElement) {
        return false;
      }
    }
  }

  return true;
}; 