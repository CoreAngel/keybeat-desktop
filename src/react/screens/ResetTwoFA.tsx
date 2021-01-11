import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import Input from '../components/Input';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { ServiceContext } from '../ServiceContext';
import { sha } from '../../libs/src/functions/crypto';
import { extractFormErrors } from '../utils/errors';
import Header from '../components/Header';
import ErrorText from '../components/ErrorText';
import BackLink from '../components/BackLink';
import { toHex } from '../../libs/src/functions/utils';
import useNetworkStatus from '../hooks/useNetworkStatus';

const ResetTwoFa = () => {
  const services = useContext(ServiceContext);
  const networkStatus = useNetworkStatus();
  const history = useHistory();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const formik = useFormik({
    initialValues: {
      login: '',
      resetKey: '',
    },
    validationSchema: Yup.object().shape({
      login: Yup.string().required('Login is required'),
      resetKey: Yup.string().required('Reset key is required'),
    }),
    onSubmit: ({ login, resetKey }) => {
      if (!networkStatus) {
        return;
      }
      handleSubmit(login, resetKey);
    },
  });

  const handleSubmit = async (login: string, resetKey: string) => {
    setErrors([]);
    setLoading(true);
    try {
      const hashedLogin = toHex(sha(login));
      const result = await reset2Fa(hashedLogin, resetKey);
      history.push('/2fa', result);
    } catch (e) {
      setErrors(e);
    } finally {
      setLoading(false);
    }
  };

  const reset2Fa = async (login: string, key: string) => {
    const result = await services.apiService.reset2FA({
      login,
      resetToken: key,
    });

    if (result.data.errors.length > 0) {
      throw result.data.errors;
    }

    return result.data.data;
  };

  return (
    <Container>
      <BackLink>
        <Header>Reset authenticator</Header>
      </BackLink>
      {!networkStatus && <ErrorText>Reset authenticator only available in online mode</ErrorText>}
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
          value={formik.values.resetKey}
          errorString={extractFormErrors(formik, 'resetKey')}
          label="Reset Key"
          name="resetKey"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          type="text"
        />
        <ButtonContainer>
          <Button type="submit" disabled={loading || !formik.isValid || !formik.dirty}>
            {loading ? <Spinner /> : 'Reset'}
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

export default ResetTwoFa;
