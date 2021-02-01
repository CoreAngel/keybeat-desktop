import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BackLink from '../../react/components/BackLink';

const mockHistoryBack = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    goBack: mockHistoryBack,
  }),
}));

describe('BackLink', () => {
  test('should back to click', () => {
    render(
      <MemoryRouter>
        <BackLink>Content</BackLink>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(mockHistoryBack).toHaveBeenCalledTimes(1);
  });

  test('should render content', () => {
    render(
      <MemoryRouter>
        <BackLink>Content</BackLink>
      </MemoryRouter>,
    );
    expect(screen.getByText('Content')).toBeTruthy();
  });
});
