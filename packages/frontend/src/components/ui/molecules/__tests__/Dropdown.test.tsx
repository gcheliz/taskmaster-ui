import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownCheckboxItem,
  DropdownRadioGroup,
  DropdownRadioItem,
} from '../Dropdown';

describe('Dropdown', () => {
  const renderDropdown = () => {
    return render(
      <Dropdown>
        <DropdownTrigger>Open Menu</DropdownTrigger>
        <DropdownContent>
          <DropdownItem>Item 1</DropdownItem>
          <DropdownItem>Item 2</DropdownItem>
          <DropdownItem disabled>Disabled Item</DropdownItem>
        </DropdownContent>
      </Dropdown>
    );
  };

  it('renders trigger button', () => {
    renderDropdown();

    expect(
      screen.getByRole('button', { name: /open menu/i })
    ).toBeInTheDocument();
  });

  it('does not show menu content initially', () => {
    renderDropdown();

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('shows menu content when trigger is clicked', () => {
    renderDropdown();

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('handles item selection', () => {
    renderDropdown();

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    fireEvent.click(screen.getByText('Item 1'));

    // Menu should close after selection
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('handles disabled items correctly', () => {
    renderDropdown();

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));

    const disabledItem = screen.getByText('Disabled Item');
    expect(disabledItem).toHaveAttribute('data-disabled', 'true');
    expect(disabledItem).toHaveAttribute('tabIndex', '-1');
  });

  it('renders checkbox items correctly', () => {
    const handleCheckedChange = vi.fn();

    render(
      <Dropdown>
        <DropdownTrigger>Menu</DropdownTrigger>
        <DropdownContent>
          <DropdownCheckboxItem
            checked={true}
            onCheckedChange={handleCheckedChange}
          >
            Checkbox Item
          </DropdownCheckboxItem>
        </DropdownContent>
      </Dropdown>
    );

    fireEvent.click(screen.getByRole('button', { name: /menu/i }));

    const checkboxItem = screen.getByRole('menuitemcheckbox');
    expect(checkboxItem).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(checkboxItem);
    expect(handleCheckedChange).toHaveBeenCalledWith(false);
  });

  it('renders radio group correctly', () => {
    const handleValueChange = vi.fn();

    render(
      <Dropdown>
        <DropdownTrigger>Menu</DropdownTrigger>
        <DropdownContent>
          <DropdownRadioGroup value="option1" onValueChange={handleValueChange}>
            <DropdownRadioItem value="option1">Option 1</DropdownRadioItem>
            <DropdownRadioItem value="option2">Option 2</DropdownRadioItem>
          </DropdownRadioGroup>
        </DropdownContent>
      </Dropdown>
    );

    fireEvent.click(screen.getByRole('button', { name: /menu/i }));

    const radioItem1 = screen.getByRole('menuitemradio', { name: 'Option 1' });
    const radioItem2 = screen.getByRole('menuitemradio', { name: 'Option 2' });

    expect(radioItem1).toHaveAttribute('aria-checked', 'true');
    expect(radioItem2).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(radioItem2);
    expect(handleValueChange).toHaveBeenCalledWith('option2');
  });

  it('has proper accessibility attributes', () => {
    renderDropdown();

    const trigger = screen.getByRole('button', { name: /open menu/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();

    const items = screen.getAllByRole('menuitem');
    expect(items).toHaveLength(3); // Including disabled item
  });

  it('applies size classes correctly', () => {
    render(
      <Dropdown>
        <DropdownTrigger size="lg">Large Menu</DropdownTrigger>
        <DropdownContent size="lg" data-testid="dropdown-content">
          <DropdownItem size="lg">Item</DropdownItem>
        </DropdownContent>
      </Dropdown>
    );

    fireEvent.click(screen.getByRole('button', { name: /large menu/i }));

    expect(screen.getByTestId('dropdown-content')).toHaveClass(
      'min-w-[12rem]',
      'text-base'
    );
  });
});
