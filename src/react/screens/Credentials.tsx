import React, { useContext, useEffect, useState } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import Spinner from '../components/Spinner';
import { ServiceContext } from '../ServiceContext';
import CredentialsList, { CredentialsListType } from '../components/CredentialsList';
import AddCredential from '../components/AddCredential';
import DisplayCredential from '../components/DisplayCredential';
import ModifyCredential from '../components/ModifyCredential';
import Button from '../components/Button';

const Credentials = () => {
  const services = useContext(ServiceContext);
  const history = useHistory();
  const credentialId = (history.location.state as any).id;
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState<CredentialsListType[]>([]);

  const loadData = async () => {
    const { id } = await services.userService.getActiveUser();
    const credentialsEncrypted = await services.credentialService.getCredentials(id);
    const credentialsItems = await Promise.all(
      credentialsEncrypted.map(async ({ id: cId, data }) => {
        const idS = cId as string;
        const { name } = await services.encryptionService.decryptCredential(data);
        return {
          id: idS,
          name,
        };
      }),
    );
    setCredentials(credentialsItems);
  };

  useEffect(() => {
    loadData();
  }, [credentialId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    })();
  }, [services]);

  const handleCreate = () => {
    history.push('/credentials/add', {
      id: null,
    });
  };

  return (
    <Container>
      {loading ? (
        <SpinnerContainer>
          <Spinner size={86} />
        </SpinnerContainer>
      ) : (
        <>
          <ListContainer>
            <CredentialsList items={credentials} />
            <CreateButton onClick={handleCreate}>Create credential</CreateButton>
          </ListContainer>
          <EditorContainer>
            <Switch>
              <Route path="/credentials/read" component={DisplayCredential} />
              <Route path="/credentials/add" component={AddCredential} />
              <Route path="/credentials/modify" component={ModifyCredential} />
            </Switch>
          </EditorContainer>
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

const SpinnerContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ListContainer = styled.div`
  width: 30%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const CreateButton = styled(Button)`
  && {
    border-radius: 0;
    margin: 10px 5px;
  }
`;

const EditorContainer = styled.div`
  width: 70%;
`;

export default Credentials;
