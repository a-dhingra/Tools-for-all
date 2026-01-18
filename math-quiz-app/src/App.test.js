import { render, screen } from '@testing-library/react';
import App from './App';

test('renders math practice quiz title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Math Practice Quiz/i);
  expect(titleElement).toBeInTheDocument();
});
