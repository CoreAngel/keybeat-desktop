import React from 'react';
import { render } from '@testing-library/react';
import Header from '../../react/components/Header';

describe('Header', () => {
  test('should render title', () => {
    const { container } = render(<Header>Header Text</Header>);
    const el = container.querySelector('h1');
    expect(el.textContent).toBe('Header Text');
  });
});
