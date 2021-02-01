import React from 'react';
import { render, screen } from '@testing-library/react';
import SmallText from '../../react/components/SmallText';

describe('SmallText', () => {
  test('should render text', () => {
    render(<SmallText>text</SmallText>);
    expect(screen.getByText('text')).toBeTruthy();
  });
});
