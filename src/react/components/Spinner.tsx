import React from 'react';
import styled, { keyframes } from 'styled-components';
import { BiLoaderAlt } from 'react-icons/bi';
import { Colors } from '../utils/colors';

interface Props {
  size?: number;
}

const Spinner = ({ size }: Props) => {
  return (
    <Container size={size}>
      <SpinnerStyled />
    </Container>
  );
};

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

Spinner.defaultProps = {
  size: 32,
};

const Container = styled.span<Props>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
`;

const SpinnerStyled = styled(BiLoaderAlt)`
  height: 100%;
  width: 100%;
  color: ${Colors.WHITE};
  animation: ${rotate} 1s infinite;
`;

export default Spinner;
