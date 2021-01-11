import React from 'react';
import styled from 'styled-components';
import { GoArrowRight } from 'react-icons/go';
import { IoCloseSharp } from 'react-icons/io5';
import UserEntity from '../../libs/src/entities/user';
import { Colors } from '../utils/colors';
import LinkButton from './LinkButton';

interface Props {
  users: UserEntity[];
  onSetActive: (user: UserEntity) => void;
  onDelete: (user: UserEntity) => void;
}

const UserList = ({ users, onDelete, onSetActive }: Props) => {
  return (
    <List>
      {users.map((user) => {
        return (
          <Item key={user.id}>
            <Name>{user.name}</Name>
            <Icon onClick={() => onDelete(user)}>
              <IoCloseSharp />
            </Icon>
            <Icon onClick={() => onSetActive(user)}>
              <GoArrowRight />
            </Icon>
          </Item>
        );
      })}
    </List>
  );
};

const List = styled.ul`
  width: 100%;
  list-style: none;
  padding: 5px 10px;
  max-height: 100px;
  overflow-y: scroll;
`;

const Item = styled.li`
  display: flex;
  color: ${Colors.WHITE};
  padding: 5px 5px;
  border-top: 1px solid ${Colors.DARK};
  border-bottom: 1px solid ${Colors.DARK};

  &:first-child {
    border-top-width: 2px;
  }

  &:last-child {
    border-bottom-width: 2px;
  }
`;

const Name = styled.p`
  margin: 0;
  flex: 1;
`;

const Icon = styled(LinkButton)`
  && {
    color: ${Colors.WHITE};
    border: none;
    padding: 0;
  }
`;

export default UserList;
