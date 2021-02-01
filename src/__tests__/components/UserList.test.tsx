import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import UserList from '../../react/components/UsersList';
import UserEntity from '../../libs/src/entities/user';

const users: UserEntity[] = [
  {
    id: 1,
    name: 'name1',
  } as UserEntity,
  {
    id: 2,
    name: 'name2',
  } as UserEntity,
];

describe('UserList', () => {
  test('should render list', () => {
    const { container } = render(<UserList users={users} onDelete={() => {}} onSetActive={() => {}} />);
    const items = container.querySelectorAll('li');
    expect(items.length).toBe(2);
  });

  test('should render empty list', () => {
    const { container } = render(<UserList users={[]} onDelete={() => {}} onSetActive={() => {}} />);
    const items = container.querySelectorAll('li');
    expect(items.length).toBe(0);
  });

  test('should trigger onDelete', () => {
    const mockFn = jest.fn();
    const { container } = render(<UserList users={users} onDelete={mockFn} onSetActive={() => {}} />);
    const item = container.querySelector('li');
    const buttons = item.querySelectorAll('button');
    fireEvent.click(buttons[0]);
    expect(mockFn).toHaveBeenCalledWith(users[0]);
  });

  test('should trigger onActive', () => {
    const mockFn = jest.fn();
    const { container } = render(<UserList users={users} onDelete={() => {}} onSetActive={mockFn} />);
    const item = container.querySelector('li');
    const buttons = item.querySelectorAll('button');
    fireEvent.click(buttons[1]);
    expect(mockFn).toHaveBeenCalledWith(users[0]);
  });
});
