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
    expect(screen.getByText('CPU cores:')).toBeInTheDocument();
    expect(screen.getByText('Memory:')).toBeInTheDocument();
    expect(screen.getByText('CPU:')).toBeInTheDocument();
    expect(screen.getByText('GPU:')).toBeInTheDocument();
    expect(screen.getByText('Battery:')).toBeInTheDocument();
    expect(screen.getByText('Network:')).toBeInTheDocument();
    expect(screen.getByText('Storage:')).toBeInTheDocument();
    expect(screen.getByText('Timezone:')).toBeInTheDocument();
    expect(screen.getByText('Languages:')).toBeInTheDocument();
  });
});