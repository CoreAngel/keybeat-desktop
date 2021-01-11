import React from 'react';
import { Button as ButtonMaterial, ButtonProps } from '@material-ui/core';
import styled from 'styled-components';
import { Colors } from '../utils/colors';

interface Props extends ButtonProps {
  children: React.ReactNode;
}

const Button = ({ children, ...rest }: Props) => {
  return <ButtonStyled {...rest}>{children}</ButtonStyled>;
};

const ButtonStyled = styled(ButtonMaterial)`
  && {
    background-color: ${Colors.PRIMARY};
    padding: 5px 25px;
    color: ${Colors.WHITE};
    font-size: 1rem;
    border: none;

    &:hover {
      background-color: ${Colors.PRIMARY_DARK};
    }

    &.Mui-disabled {
      color: ${Colors.WHITE70};
      background-color: ${Colors.DARK};
    }
  }
`;

export default Button;
