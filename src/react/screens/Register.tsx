import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Input from '../components/Input';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { ServiceContext } from '../ServiceContext';
import { generateSalt, sha, pbkdf2 } from '../../libs/src/functions/crypto';
import { extractFormErrors } from '../utils/errors';
import Header from '../components/Header';
import ErrorText from '../components/ErrorText';
import SmallText from '../components/SmallText';
import BackLink from '../components/BackLink';
import { toHex } from '../../libs/src/functions/utils';
import useNetworkStatus from '../hooks/useNetworkStatus';

interface RegisterType {
  name: string;
  salt: string;
  login: string;
  password: string;
  passwordLocal: string;
}

const Register = () => {
  const services = useContext(ServiceContext);
  const history = useHistory();
  const networkStatus = useNetworkStatus();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      login: '',
      password: '',
      repeatPassword: '',
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().min(3, 'Name must be at least 3 characters long').required('Name is required'),
      login: Yup.string().min(3, 'Login must be at least 3 characters long').required('Login is required'),
      password: Yup.string().min(8, 'Password must be at least 8 characters long').required('Password is required'),
      repeatPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    onSubmit: ({ name, login, password }) => {
      if (!networkStatus) {
        return;
      }
      handleSubmit(name, login, password);
    },
  });

  const handleSubmit = async (name: string, login: string, password: string) => {
    setErrors([]);
    setLoading(true);
    try {
      const hashedLogin = toHex(sha(login));
      const hashedPassword = toHex(sha(password));
      const salt = generateSalt();
      const passwordKey = pbkdf2(hashedPassword, salt, 150000, 64);
      const passwordKeyLocal = pbkdf2(passwordKey, salt, 150000, 64);

      const data = {
        name,
        salt,
        login: hashedLogin,
        password: passwordKey,
        passwordLocal: passwordKeyLocal,
      };

      const result = await registerAccount(data);
      history.push('/2fa', result);
    } catch (e) {
      setErrors(e);
    } finally {
      setLoading(false);
    }
  };

  const registerAccount = async ({ login, salt, passwordLocal, password, name }: RegisterType) => {
    const result = await services.apiService.register({ name, password, salt, login });
    const { uri, secret, reset } = result.data.data;
    if (result.data.errors.length > 0) {
      throw result.data.errors;
    }
    await services.userService.createOrUpdate({ name, login, salt, hash: passwordLocal, active: true });
    return {
      uri,
      secret,
      reset,
    };
  };

  return (
    <Container>
      <BackLink>
        <Header>Register</Header>
      </BackLink>
      {!networkStatus && <ErrorText>Register only available in online mode</ErrorText>}
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
          type="password"
        />
        <Input
          value={formik.values.repeatPassword}
          errorString={extractFormErrors(formik, 'repeatPassword')}
          label="Confirm password"
          name="repeatPassword"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          type="password"
        />
        <SmallText>Enter a strong and memorable password eg. correct horse battery staple</SmallText>
        <ButtonContainer>
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

export default Register;
