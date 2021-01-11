import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import Input from '../components/Input';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { ServiceContext } from '../ServiceContext';
import { sha, pbkdf2 } from '../../libs/src/functions/crypto';
import { extractFormErrors } from '../utils/errors';
import Header from '../components/Header';
import ErrorText from '../components/ErrorText';
import BackLink from '../components/BackLink';
import { toHex } from '../../libs/src/functions/utils';
import useNetworkStatus from '../hooks/useNetworkStatus';

const Login = () => {
  const services = useContext(ServiceContext);
  const networkStatus = useNetworkStatus();
  const history = useHistory();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const formik = useFormik({
    initialValues: {
      login: '',
      password: '',
      token: '',
    },
    validationSchema: Yup.object().shape({
      login: Yup.string().required('Login is required'),
      password: Yup.string().required('Password is required'),
      token: Yup.string()
        .required('Token must have 6 characters long')
        .length(6, 'Token must have 6 characters long')
        .matches(/^\d+$/, 'Token can contain only digits'),
    }),
    onSubmit: ({ login, password, token }) => {
      if (!networkStatus) {
        return;
      }

      handleSubmit(login, password, token);
    },
  });

  const handleSubmit = async (login: string, password: string, token: string) => {
    setErrors([]);
    setLoading(true);
    try {
      const hashedLogin = toHex(sha(login));
      const hashedPassword = toHex(sha(password));
      const salt = await getSalt(hashedLogin, token);
      const passwordKey = pbkdf2(hashedPassword, salt, 150000, 64);
      const passwordKeyLocal = pbkdf2(passwordKey, salt, 150000, 64);
      const { name, auth } = await loginToApi(hashedLogin, passwordKey, token);
      const user = await services.userService.createOrUpdate({
        name,
        login: hashedLogin,
        salt,
        hash: passwordKeyLocal,
        active: true,
      });
      services.tokenService.setToken(auth);
      services.networkService.setUserStatus(true);
      await services.synchronizationService.synchronize(user.id, user.lastSynchronize);
      await services.passwordService.setUserPassword(hashedLogin, hashedPassword);
      history.push('/credentials/read', {
        id: null,
      });
    } catch (e) {
      setErrors(e);
    } finally {
      setLoading(false);
    }
  };

  const getSalt = async (login: string, token: string) => {
    const user = await services.userService.findUserByLogin(login);
    if (user) {
      return user.salt;
    }

    const result = await services.apiService.salt({
      login,
      token,
    });

    if (result.data.errors.length > 0) {
      throw result.data.errors;
    }

    return result.data.data.salt;
  };

  const loginToApi = async (login: string, password: string, token: string) => {
    const result = await services.apiService.login({
      login,
      password,
      token,
    });

    if (result.data.errors.length > 0) {
      throw result.data.errors;
    }

    return result.data.data;
  };

  return (
    <Container>
      <BackLink>
        <Header>Login</Header>
      </BackLink>
      {!networkStatus && <ErrorText>Register only available in online mode</ErrorText>}
      <Form onSubmit={formik.handleSubmit}>
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
          type="password"
        />
        <Input
          value={formik.values.token}
          errorString={extractFormErrors(formik, 'token')}
          label="Token"
          name="token"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          type="text"
        />
        <ButtonContainer>
          <Button type="submit" disabled={loading || !formik.isValid || !formik.dirty}>
            {loading ? <Spinner /> : 'Login'}
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
  max-width: 500px;
  margin: 0 auto;
  padding: 0 10px;
`;

const Form = styled.form`
  width: 100%;
  text-align: center;
`;

const ButtonContainer = styled.div`
  margin: 20px 0;
  text-align: center;
`;

export default Login;
