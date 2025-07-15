import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders vite + react heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/vite \+ react/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders learn more text', () => {
  render(<App />);
  const linkElement = screen.getByText(/click on the vite and react logos to learn more/i);
  expect(linkElement).toBeInTheDocument();
});