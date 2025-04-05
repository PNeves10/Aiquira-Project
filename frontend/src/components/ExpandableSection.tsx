import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

/**
 * Props for the ExpandableSection component
 * @interface ExpandableSectionProps
 * @property {string} title - The title text displayed in the section header
 * @property {React.ReactNode} children - The content to be displayed when expanded
 * @property {boolean} [defaultExpanded=false] - Whether the section is expanded by default
 * @property {string} [className=''] - Additional CSS classes to apply to the container
 */
interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

/**
 * A collapsible section component with smooth animations and accessibility features
 * @component
 * @example
 * ```tsx
 * <ExpandableSection title="Section Title">
 *   <p>This content will be shown when expanded</p>
 * </ExpandableSection>
 * ```
 * @param {ExpandableSectionProps} props - The component props
 * @returns {JSX.Element} The rendered expandable section component
 */
export const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  children,
  defaultExpanded = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-expanded={isExpanded}
        aria-controls={`expandable-content-${title}`}
      >
        <span className="text-lg font-medium text-gray-900">{title}</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            id={`expandable-content-${title}`}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 bg-gray-50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 