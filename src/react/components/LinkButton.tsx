import React from 'react';
import { Button as ButtonMaterial, ButtonProps } from '@material-ui/core';
import styled from 'styled-components';
import { Colors } from '../utils/colors';

interface Props extends ButtonProps {
  children: React.ReactNode;
}

const LinkButton = ({ children, ...rest }: Props) => {
  return <ButtonStyled {...rest}>{children}</ButtonStyled>;
};

const ButtonStyled = styled(ButtonMaterial)`
  && {
    background-color: transparent;
    padding: 5px 15px;
    color: ${Colors.WHITE};
    font-size: 1rem;
    text-transform: capitalize;

    &:hover {
      color: ${Colors.WHITE70};
    }

    &.Mui-disabled {
      color: ${Colors.DARK};
    }
  }
`;

export default LinkButton;
