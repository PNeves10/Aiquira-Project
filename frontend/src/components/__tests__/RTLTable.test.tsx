import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RTLTable } from '../RTLTable';
import { renderWithI18n, changeLanguage } from '../../test/i18n-test-utils';

interface TestData {
  id: number;
  name: string;
  age: number;
  email: string;
}

const testData: TestData[] = [
  { id: 1, name: 'John Doe', age: 30, email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', age: 35, email: 'bob@example.com' },
];

const columns = [
  { key: 'id', header: 'ID', sortable: true },
  { key: 'name', header: 'Name', sortable: true, filterable: true },
  { key: 'age', header: 'Age', sortable: true },
  { key: 'email', header: 'Email', filterable: true },
];

describe('RTLTable', () => {
  beforeEach(() => {
    changeLanguage('en');
  });

  describe('Basic Rendering', () => {
    it('renders table with data', () => {
      renderWithI18n(<RTLTable data={testData} columns={columns} />);
      
      // Check headers
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      
      // Check data
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('renders empty table', () => {
      renderWithI18n(<RTLTable data={[]} columns={columns} />);
      
      // Check headers
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      
      // Check no data rows
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('sorts data when clicking sortable column header', () => {
      const onSort = jest.fn();
      renderWithI18n(
        <RTLTable
          data={testData}
          columns={columns}
          onSort={onSort}
        />
      );
      
      // Click name column header
      fireEvent.click(screen.getByText('Name'));
      
      expect(onSort).toHaveBeenCalledWith('name', 'asc');
    });

    it('toggles sort direction on repeated clicks', () => {
      const onSort = jest.fn();
      renderWithI18n(
        <RTLTable
          data={testData}
          columns={columns}
          onSort={onSort}
        />
      );
      
      // Click name column header twice
      fireEvent.click(screen.getByText('Name'));
      fireEvent.click(screen.getByText('Name'));
      
      expect(onSort).toHaveBeenCalledWith('name', 'desc');
    });

    it('does not sort when clicking non-sortable column', () => {
      const onSort = jest.fn();
      renderWithI18n(
        <RTLTable
          data={testData}
          columns={columns}
          onSort={onSort}
        />
      );
      
      // Click email column header
      fireEvent.click(screen.getByText('Email'));
      
      expect(onSort).not.toHaveBeenCalled();
    });
  });

  describe('Filtering', () => {
    it('filters data when typing in filter input', () => {
      const onFilter = jest.fn();
      renderWithI18n(
        <RTLTable
          data={testData}
          columns={columns}
          onFilter={onFilter}
        />
      );
      
      // Type in name filter
      const nameFilter = screen.getByPlaceholderText('Filter name...');
      fireEvent.change(nameFilter, { target: { value: 'John' } });
      
      expect(onFilter).toHaveBeenCalledWith('name', 'John');
    });

    it('clears filter when input is cleared', () => {
      const onFilter = jest.fn();
      renderWithI18n(
        <RTLTable
          data={testData}
          columns={columns}
          onFilter={onFilter}
        />
      );
      
      // Type and clear name filter
      const nameFilter = screen.getByPlaceholderText('Filter name...');
      fireEvent.change(nameFilter, { target: { value: 'John' } });
      fireEvent.change(nameFilter, { target: { value: '' } });
      
      expect(onFilter).toHaveBeenCalledWith('name', '');
    });
  });

  describe('RTL Support', () => {
    it('renders in LTR mode by default', () => {
      const { container } = renderWithI18n(<RTLTable data={testData} columns={columns} />);
      expect(container.firstChild).toHaveAttribute('dir', 'ltr');
    });

    it('renders in RTL mode for Arabic', async () => {
      await changeLanguage('ar');
      const { container } = renderWithI18n(<RTLTable data={testData} columns={columns} />);
      expect(container.firstChild).toHaveAttribute('dir', 'rtl');
    });

    it('maintains RTL layout when sorting', async () => {
      await changeLanguage('ar');
      const { container } = renderWithI18n(<RTLTable data={testData} columns={columns} />);
      
      // Click sortable column
      fireEvent.click(screen.getByText('Name'));
      
      expect(container.firstChild).toHaveAttribute('dir', 'rtl');
    });

    it('maintains RTL layout when filtering', async () => {
      await changeLanguage('ar');
      const { container } = renderWithI18n(<RTLTable data={testData} columns={columns} />);
      
      // Type in filter
      const nameFilter = screen.getByPlaceholderText('Filter name...');
      fireEvent.change(nameFilter, { target: { value: 'John' } });
      
      expect(container.firstChild).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Custom Rendering', () => {
    const customColumns = [
      ...columns,
      {
        key: 'actions',
        header: 'Actions',
        render: (item: TestData) => (
          <button onClick={() => console.log(item.id)}>Edit</button>
        ),
      },
    ];

    it('renders custom content using render prop', () => {
      renderWithI18n(<RTLTable data={testData} columns={customColumns} />);
      
      // Check custom rendered content
      expect(screen.getAllByText('Edit')).toHaveLength(testData.length);
    });

    it('maintains RTL layout with custom rendered content', async () => {
      await changeLanguage('ar');
      const { container } = renderWithI18n(<RTLTable data={testData} columns={customColumns} />);
      expect(container.firstChild).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderWithI18n(<RTLTable data={testData} columns={columns} />);
      
      // Check table role
      expect(screen.getByRole('table')).toBeInTheDocument();
      
      // Check header cells
      expect(screen.getAllByRole('columnheader')).toHaveLength(columns.length);
      
      // Check data cells
      expect(screen.getAllByRole('cell')).toHaveLength(testData.length * columns.length);
    });

    it('maintains accessibility in RTL mode', async () => {
      await changeLanguage('ar');
      renderWithI18n(<RTLTable data={testData} columns={columns} />);
      
      // Check table role
      expect(screen.getByRole('table')).toBeInTheDocument();
      
      // Check header cells
      expect(screen.getAllByRole('columnheader')).toHaveLength(columns.length);
      
      // Check data cells
      expect(screen.getAllByRole('cell')).toHaveLength(testData.length * columns.length);
    });
  });
}); 