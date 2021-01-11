import React from 'react';
import styled from 'styled-components';
import { Colors } from '../utils/colors';

interface Props {
  children: React.ReactNode;
}

const Header = ({ children }: Props) => {
  return <Title>{children}</Title>;
};

const Title = styled.h1`
  font-size: 1.5rem;
  color: ${Colors.WHITE};
  text-transform: uppercase;
`;

export default Header;
