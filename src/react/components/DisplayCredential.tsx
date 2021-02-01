import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import Input from './Input';
import Button from './Button';
import Spinner from './Spinner';
import { ServiceContext } from '../ServiceContext';
import { Colors } from '../utils/colors';
import { sha } from '../../libs/src/functions/crypto';
import SecondaryButton from './SecondaryButton';
import useCredentialId from '../hooks/useCredentialId';

const DisplayCredential = () => {
  const services = useContext(ServiceContext);
  const history = useHistory();
  const credentialId = useCredentialId();
  const [credential, setCredential] = useState(null);
  const [showed, setShowed] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    setShowed(false);
  }, [credentialId]);

  useEffect(() => {
    (async () => {
      if (credentialId) {
        const encryptedData = await services.credentialService.getCredential(credentialId);
        const decryptedCredential = await services.encryptionService.decryptCredential(encryptedData.data);
        setCredential(decryptedCredential);
        setPassword(decryptedCredential.password);
      }
    })();
  }, [credentialId, services]);

  const handleShowPassword = async () => {
    if (showed) {
      setPassword(credential.password);
      setShowed(false);
    } else {
      const decryptedPassword = await services.encryptionService.decryptString(credential.password);
      setPassword(decryptedPassword);
      setShowed(true);
    }
  };

  const handleCopyPassword = async () => {
    const decryptedPassword = await services.encryptionService.decryptString(credential.password);
    await services.clipboardService.write(decryptedPassword);
    setTimeout(() => {
      const hash = sha(decryptedPassword);
      services.communicationService.clearClipboard({ hash });
    }, 5000);
  };

  const handleAutoType = async () => {
    const decryptedPassword = await services.encryptionService.decryptString(credential.password);
    await services.communicationService.setAutoTypePassword({ password: decryptedPassword });
    setTimeout(() => {
      services.communicationService.setAutoTypePassword({ password: '' });
    }, 5000);
  };

  const handleEdit = () => {
    history.push('/credentials/modify', {
      id: credentialId,
    });
  };

  return (
    <Container>
      {!credentialId && <SelectInfo>Select item from left menu</SelectInfo>}
      {!credential ? (
        credentialId && <Spinner />
      ) : (
        <>
          <Form>
            <Input value={credential.name} errorString={null} label="Name" name="name" type="text" />
            <Input value={credential.login} errorString={null} label="Login" name="login" type="text" />
            <Input
              value={password}
              errorString={null}
              label="Password"
              name="password"
              type={showed ? 'text' : 'password'}
            />
            <ButtonContainer>
              <Button onClick={handleShowPassword}>{showed ? 'Hide password' : 'Show password'}</Button>
            </ButtonContainer>
            <ButtonContainer>
              <Button onClick={handleCopyPassword}>Copy to clipboard</Button>
            </ButtonContainer>
            <ButtonContainer>
              <Button onClick={handleAutoType}>Auto type (ctrl+F8)</Button>
            </ButtonContainer>
          </Form>
          <EditButtonContainer>
            <SecondaryButton onClick={handleEdit}>Edit</SecondaryButton>
          </EditButtonContainer>
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
  margin: 0 auto;
  padding: 0 10px;
`;

const SelectInfo = styled.p`
  text-align: center;
  color: ${Colors.WHITE};
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  text-align: center;

  & > .MuiTextField-root {
    && {
      width: calc(100% - 20px);
    }
  }
`;

const ButtonContainer = styled.div`
  margin: 10px;
`;

const EditButtonContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
`;

export default DisplayCredential;
