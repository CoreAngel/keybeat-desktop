import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import Input from './Input';
import Button from './Button';
import Spinner from './Spinner';
import { ServiceContext } from '../ServiceContext';
import { extractFormErrors } from '../utils/errors';
import ErrorText from './ErrorText';
import { ActionType } from '../../libs/src/entities/action';
import SecondaryButton from './SecondaryButton';
import useCredentialId from '../hooks/useCredentialId';

const ModifyCredential = () => {
  const services = useContext(ServiceContext);
  const userNetwork = services.networkService.getUserStatus();
  const history = useHistory();
  const credentialId = useCredentialId();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const formik = useFormik({
    initialValues: {
      uuid: '',
      name: '',
      login: '',
      password: '',
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required('Name is required'),
      login: Yup.string().required('Login is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: ({ name, login, password }) => {
      handleSubmit(name, login, password);
    },
  });

  useEffect(() => {
    (async () => {
      if (credentialId) {
        const encryptedData = await services.credentialService.getCredential(credentialId);
        const { name, login, password } = await services.encryptionService.decryptCredential(encryptedData.data);
        const decryptedPassword = await services.encryptionService.decryptString(password);
        await formik.setValues({
          uuid: encryptedData.uuid,
          name,
          login,
          password: decryptedPassword,
        });
      }
    })();
  }, [credentialId, services]);

  const handleSubmit = async (name: string, login: string, password: string) => {
    setLoading(true);
    setErrors([]);
    try {
      const activeUser = await services.userService.getActiveUser();
      const encryptedPassword = await services.encryptionService.encryptString(password);
      const encryptedData = await services.encryptionService.encryptCredential({
        name,
        login,
        password: encryptedPassword,
      });
      await services.credentialService.modifyCredential(credentialId, encryptedData);

      if (userNetwork) {
        const result = await services.apiService.modifyCredential([
          {
            id: formik.values.uuid,
            data: encryptedData,
          },
        ]);
        if (result.data.errors.lenght > 0) {
          throw result.data.errors;
        }
      } else {
        await services.actionService.create({
          credentialId,
          userId: activeUser.id,
          type: ActionType.MODIFIED,
        });
      }
      goToDisplayScreen();
    } catch (e) {
      console.log(e);
      setErrors(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setErrors([]);
    try {
      const activeUser = await services.userService.getActiveUser();
      await services.credentialService.deleteCredentialById(credentialId);
      if (userNetwork) {
        const result = await services.apiService.deleteCredential([
          {
            id: formik.values.uuid,
          },
        ]);
        if (result.data.errors.lenght > 0) {
          throw result.data.errors;
        }
      } else {
        await services.actionService.create({
          credentialId,
          userId: activeUser.id,
          type: ActionType.DELETED,
        });
      }
      history.push('/credentials/read', {
        id: null,
      });
    } catch (e) {
      console.log(e);
      setErrors(e);
    } finally {
      setLoading(false);
    }
  };

  const goToDisplayScreen = () => {
    history.push('/credentials/read', {
      id: credentialId,
    });
  };

  return (
    <Container>
      <Form onSubmit={formik.handleSubmit}>
        <Input
          value={formik.values.name}
          errorString={extractFormErrors(formik, 'name')}
          label="Name"
          name="name"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          type="text"
        />
        <Input
          value={formik.values.login}
          errorString={extractFormErrors(formik, 'login')}
          label="Login"
          name="login"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          type="text"
        />
        <Input
          value={formik.values.password}
          errorString={extractFormErrors(formik, 'password')}
          label="Password"
          name="password"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          type="text"
        />
        <ButtonContainer>
          <SecondaryButton onClick={goToDisplayScreen}>Cancel</SecondaryButton>
          <SecondaryButton onClick={handleDelete}>Delete</SecondaryButton>
          <Button type="submit" disabled={loading || !formik.isValid || !formik.dirty}>
            {loading ? <Spinner /> : 'Save'}
          </Button>
        </ButtonContainer>
        {errors.map((error) => (
          <ErrorText key={error}>{error}</ErrorText>
        ))}
      </Form>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 0 auto;
  padding: 0 10px;
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
  max-width: 400px;
  margin: 20px auto;
  text-align: center;
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

export default ModifyCredential;
