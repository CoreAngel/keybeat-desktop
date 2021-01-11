import React from 'react';
import styled from 'styled-components';
import { Colors } from '../utils/colors';

interface Props {
  children: React.ReactNode;
}

const SmallText = ({ children }: Props) => {
  return <Text>{children}</Text>;
};

const Text = styled.p`
  font-size: 0.8rem;
  color: ${Colors.WHITE70};
  margin: 5px;
`;

export default SmallText;
