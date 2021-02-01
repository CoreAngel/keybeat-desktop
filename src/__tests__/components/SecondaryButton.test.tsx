import React from 'react';
import { render, screen } from '@testing-library/react';
import SecondaryButton from '../../react/components/SecondaryButton';

describe('SecondaryButton', () => {
  test('should render title', () => {
    render(<SecondaryButton>Button</SecondaryButton>);
    expect(screen.getByText('Button')).toBeTruthy();
  });
});
