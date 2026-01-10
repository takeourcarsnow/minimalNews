import { render, screen, fireEvent } from '@testing-library/react';
import TodoWidget from '../TodoWidget';

describe('TodoWidget', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the widget', () => {
    render(<TodoWidget />);
    expect(screen.getByText('todo --list')).toBeInTheDocument();
  });

  it('adds a new todo', () => {
    render(<TodoWidget />);
    const input = screen.getByPlaceholderText('Add a new task...');
    const addButton = screen.getByText('[add]');

    fireEvent.change(input, { target: { value: 'Test task' } });
    fireEvent.click(addButton);

    expect(screen.getByText('Test task')).toBeInTheDocument();
  });

  it('toggles todo completion', () => {
    render(<TodoWidget />);
    const input = screen.getByPlaceholderText('Add a new task...');
    const addButton = screen.getByText('[add]');

    fireEvent.change(input, { target: { value: 'Test task' } });
    fireEvent.click(addButton);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(screen.getByText('Test task')).toHaveClass('completed');
  });

  it('deletes a todo', () => {
    render(<TodoWidget />);
    const input = screen.getByPlaceholderText('Add a new task...');
    const addButton = screen.getByText('[add]');

    fireEvent.change(input, { target: { value: 'Test task' } });
    fireEvent.click(addButton);

    const deleteButton = screen.getByText('[x]');
    fireEvent.click(deleteButton);

    expect(screen.queryByText('Test task')).not.toBeInTheDocument();
  });
});