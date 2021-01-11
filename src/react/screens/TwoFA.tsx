import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../components/Button';
import { generateQrDataUrl } from '../../libs/src/functions/utils';
import Header from '../components/Header';
import { Colors } from '../utils/colors';
import SmallText from '../components/SmallText';

interface TwoFAProps {
  location: {
    state: {
      uri: string;
      secret: string;
      reset: string;
    };
  };
}

const TwoF2 = ({ location: { state } }: TwoFAProps) => {
  const [qrCode, setQrCode] = useState('');
  const history = useHistory();

  useEffect(() => {
    (async () => {
      const code = await generateQrDataUrl(state.uri);
      setQrCode(code);
    })();
  });

  const handleConfirm = () => {
    history.push('/');
  };

  return (
    <Container>
      <Header>2FA</Header>
      <SmallText>Scan QRCode or rewrite secret to google authenticator.</SmallText>
      <SmallText>Rewrite or copy reset key. Only with this key you can change authenticator.</SmallText>
      {qrCode !== '' && (
        <>
          <QrImage src={qrCode} alt="QRCode for assign authenticator" />
          <Title>Secret</Title>
          <Text>{state.secret}</Text>
          <Title>Reset key</Title>
          <Text>{state.reset}</Text>
        </>
      )}
      <ButtonContainer>
        <Button onClick={handleConfirm}>OK</Button>
      </ButtonContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 0 10px;
`;

const Title = styled.h2`
  font-size: 1.1rem;
  color: ${Colors.WHITE};
  text-transform: uppercase;
  margin-bottom: 5px;
`;

const Text = styled.p`
  font-size: 0.9rem;
  color: ${Colors.WHITE};
  margin: 5px;
`;

const QrImage = styled.img`
  margin-top: 10px;
  margin-bottom: 10px;
`;

const ButtonContainer = styled.div`
  margin-top: 20px;
`;

export default TwoF2;
