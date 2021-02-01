import React from 'react';
import { render, screen } from '@testing-library/react';
import LinkButton from '../../react/components/LinkButton';

describe('LinkButton', () => {
  test('should render title', () => {
    render(<LinkButton>Button</LinkButton>);
    expect(screen.getByText('Button')).toBeTruthy();
  });
});
