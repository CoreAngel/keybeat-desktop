import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Input from '../../react/components/Input';

describe('Input', () => {
  test('should render error', () => {
    render(<Input errorString="error" label="label" />);
    expect(screen.getByText('error')).toBeTruthy();
  });

  test('should render label', () => {
    render(<Input errorString="error" label="label" />);
    expect(screen.getByText('label')).toBeTruthy();
  });

  test('should render value', () => {
    const { container } = render(<Input errorString="error" label="label" value="value" />);
    const input = container.querySelector('input');
    expect(input.value).toBe('value');
  });

  test('should trigger change', () => {
    const onChange = jest.fn();
    const { container } = render(<Input errorString="error" label="label" value="value" onChange={onChange} />);
    const input = container.querySelector('input');
    fireEvent.change(input, { target: { value: 'value1' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
