import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../Tabs';

describe('Tabs', () => {
  const renderTabs = (defaultValue = 'tab1') => {
    return render(
      <Tabs defaultValue={defaultValue}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>
    );
  };

  it('renders tabs with default active tab', () => {
    renderTabs();
    
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('switches tabs when clicked', () => {
    renderTabs();
    
    fireEvent.click(screen.getByRole('tab', { name: 'Tab 2' }));
    
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
  });

  it('handles controlled mode', () => {
    const handleValueChange = vi.fn();
    
    render(
      <Tabs value="tab1" onValueChange={handleValueChange}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    
    fireEvent.click(screen.getByRole('tab', { name: 'Tab 2' }));
    
    expect(handleValueChange).toHaveBeenCalledWith('tab2');
  });

  it('applies variant classes correctly', () => {
    render(
      <Tabs defaultValue="tab1" variant="line">
        <TabsList data-testid="tabs-list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    );
    
    expect(screen.getByTestId('tabs-list')).toHaveClass('border-b', 'border-secondary-200');
  });

  it('has proper accessibility attributes', () => {
    renderTabs();
    
    const tabList = screen.getByRole('tablist');
    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    const panel1 = screen.getByRole('tabpanel');
    
    expect(tabList).toBeInTheDocument();
    expect(tab1).toHaveAttribute('aria-controls', 'panel-tab1');
    expect(panel1).toHaveAttribute('aria-labelledby', 'tab-tab1');
    expect(panel1).toHaveAttribute('id', 'panel-tab1');
  });
});