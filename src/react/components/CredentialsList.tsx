import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { Button, ButtonProps } from '@material-ui/core';
import { Colors } from '../utils/colors';

export interface CredentialsListType {
  id: string;
  name: string;
}

interface Props {
  items: CredentialsListType[];
}

const CredentialsList = ({ items }: Props) => {
  const history = useHistory();
  const credentialId = (history.location.state as any).id;
  const handleClick = (id: string) => {
    history.push('/credentials/read', {
      id,
    });
  };

  return (
    <>
      {items.length === 0 ? (
        <NoItemsInfo>Nothing to display. Please add the item first.</NoItemsInfo>
      ) : (
        <Container>
          {items.map(({ id, name }) => (
            <Item key={id} activeItem={id === credentialId} onClick={() => handleClick(id)}>
              {name}
            </Item>
          ))}
        </Container>
      )}
    </>
  );
};

const Container = styled.div`
  width: 100%;
  background: ${Colors.DARK};
`;

interface ItemProps extends ButtonProps {
  activeItem: boolean;
}

const NoItemsInfo = styled.p`
  margin: 10px 5px;
  text-align: center;
  color: ${Colors.WHITE};
`;

const Item = styled(({ activeItem, ...rest }: ItemProps) => <Button {...rest} />)`
  && {
    width: 100%;
    padding: 10px;
    background: ${({ activeItem }) => (activeItem ? Colors.DARKER : 'transparent')};
    outline: none;
    border: none;
    border-top: 2px solid ${Colors.WHITE70};
    color: ${Colors.WHITE};
    text-align: left;
    border-radius: 0;

    &:hover {
      background: ${({ activeItem }) => (activeItem ? Colors.DARKER : Colors.DARK)};
    }

    &:first-child {
      border-top: none;
    }

    &:last-child {
      border-bottom: 2px solid ${Colors.WHITE70};
    }
  }
`;

export default CredentialsList;
