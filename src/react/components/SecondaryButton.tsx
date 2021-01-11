import React from 'react';
import { Button as ButtonMaterial, ButtonProps } from '@material-ui/core';
import styled from 'styled-components';
import { Colors } from '../utils/colors';

interface Props extends ButtonProps {
  children: React.ReactNode;
}

const SecondaryButton = ({ children, ...rest }: Props) => {
  return <ButtonStyled {...rest}>{children}</ButtonStyled>;
};

const ButtonStyled = styled(ButtonMaterial)`
  && {
    background-color: transparent;
    padding: 5px 25px;
    color: ${Colors.PRIMARY};
    font-size: 1rem;
    border: solid 2px ${Colors.PRIMARY};

    &:hover {
      color: ${Colors.PRIMARY_DARK};
      border-color: ${Colors.PRIMARY_DARK};
    }

    &.Mui-disabled {
      color: ${Colors.WHITE70};
      border-color: ${Colors.DARK};
    }
  }
`;

export default SecondaryButton;
