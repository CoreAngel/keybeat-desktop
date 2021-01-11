import React from 'react';
import styled from 'styled-components';
import { IoIosArrowBack } from 'react-icons/io';
import { useHistory } from 'react-router-dom';
import LinkButton from './LinkButton';

interface Props {
  children: React.ReactNode;
}

const BackLink = ({ children }: Props) => {
  const history = useHistory();
  const back = () => {
    history.goBack();
  };

  return (
    <Container>
      <BackButtonContainer>
        <LinkButton onClick={() => back()}>
          <IoIosArrowBack />
        </LinkButton>
      </BackButtonContainer>
      {children}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BackButtonContainer = styled.div`
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  position: absolute;
`;

export default BackLink;
