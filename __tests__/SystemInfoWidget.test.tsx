import { render, screen } from '@testing-library/react';
import SystemInfoWidget from '../SystemInfoWidget';

describe('SystemInfoWidget', () => {
  it('renders the widget', () => {
    render(<SystemInfoWidget />);
    expect(screen.getByText('neofetch')).toBeInTheDocument();
  });

  it('displays system information', () => {
    render(<SystemInfoWidget />);
    expect(screen.getByText('OS:')).toBeInTheDocument();
    expect(screen.getByText('Browser:')).toBeInTheDocument();
    expect(screen.getByText('Resolution:')).toBeInTheDocument();
  });
});