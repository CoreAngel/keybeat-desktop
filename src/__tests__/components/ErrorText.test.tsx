import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorText from '../../react/components/ErrorText';

describe('ErrorText', () => {
  test('should render text', () => {
    render(<ErrorText>error</ErrorText>);
    expect(screen.getByText('error')).toBeTruthy();
  });
});
