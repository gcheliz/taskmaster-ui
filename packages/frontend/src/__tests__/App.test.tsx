import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders TaskMaster UI welcome heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/welcome to taskmaster ui/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders dashboard overview section', () => {
  render(<App />);
  const overviewElement = screen.getByText(/dashboard overview/i);
  expect(overviewElement).toBeInTheDocument();
});

test('renders demo counter button', () => {
  render(<App />);
  const buttonElement = screen.getByRole('button', { name: /count is 0/i });
  expect(buttonElement).toBeInTheDocument();
});

test('renders quick stats section', () => {
  render(<App />);
  const statsElement = screen.getByText(/quick stats/i);
  expect(statsElement).toBeInTheDocument();
  
  // Check for stat items - using more specific queries
  expect(screen.getByText(/active tasks/i)).toBeInTheDocument();
  expect(screen.getByText(/completed today/i)).toBeInTheDocument();
  
  // Check specifically for the repositories stat item (h4 element)
  const repositoriesStatHeader = screen.getAllByText(/repositories/i).find(element => 
    element.tagName.toLowerCase() === 'h4'
  );
  expect(repositoriesStatHeader).toBeInTheDocument();
});