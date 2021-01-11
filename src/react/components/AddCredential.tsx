import React, { useContext, useState } from 'react';
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

const AddCredential = () => {
  const services = useContext(ServiceContext);
  const userNetwork = services.networkService.getUserStatus();
  const history = useHistory();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const formik = useFormik({
    initialValues: {
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
      const credential = await services.credentialService.create({
        userId: activeUser.id,
        data: encryptedData,
      });

      if (userNetwork) {
        const result = await services.apiService.addCredential([
          {
            id: credential.id,
            data: encryptedData,
          },
        ]);
        if (result.data.errors.lenght > 0) {
          throw result.data.errors;
        }
        const { id, uuid } = result.data.data.items[0];
        await services.credentialService.setUuid(id, uuid);
      } else {
        await services.actionService.create({
          credentialId: credential.id,
          userId: activeUser.id,
          type: ActionType.CREATED,
        });
      }
      history.push('/credentials/read', {
        id: credential.id,
      });
    } catch (e) {
      setErrors(e);
    } finally {
      setLoading(false);
    }
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
          <Button type="submit" disabled={loading || !formik.isValid || !formik.dirty}>
            {loading ? <Spinner /> : 'Add'}
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
  margin: 20px 0;
  text-align: center;
`;

export default AddCredential;
