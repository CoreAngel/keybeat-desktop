import React, { useContext, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import { ServiceContext } from '../ServiceContext';
import useNetworkStatus from '../hooks/useNetworkStatus';
import ErrorText from '../components/ErrorText';
import Header from '../components/Header';
import BackLink from '../components/BackLink';
import Input from '../components/Input';
import { extractFormErrors } from '../utils/errors';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { Colors } from '../utils/colors';

const Exposed = () => {
  const services = useContext(ServiceContext);
  const networkStatus = useNetworkStatus();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exposed, setExposed] = useState<number | null>(null);
  const formik = useFormik({
    initialValues: {
      password: '',
    },
    validationSchema: Yup.object().shape({
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: ({ password }) => {
      if (!networkStatus) {
        return;
      }
      handleSubmit(password);
    },
  });

  const handleSubmit = async (password: string) => {
    setErrors([]);
    setLoading(true);
    try {
      const exposedNumber = await services.exposedService.checkPassword(password);
      setExposed(exposedNumber);
    } catch (e) {
      setErrors(['Request failed']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <BackLink>
        <Header>Check if password is exposed</Header>
      </BackLink>
      {!networkStatus && <ErrorText>Check if password is exposed only available in online mode</ErrorText>}
      <Form onSubmit={formik.handleSubmit}>
        <Input
          value={formik.values.password}
          errorString={extractFormErrors(formik, 'password')}
          label="Password"
          name="password"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          type="password"
        />
        <ButtonContainer>
          <Button type="submit" disabled={loading || !formik.isValid || !formik.dirty}>
            {loading ? <Spinner /> : 'Check'}
          </Button>
        </ButtonContainer>
        {exposed !== null &&
          (exposed === 0 ? (
            <InfoText color={Colors.GREEN}>Password is safe</InfoText>
          ) : (
            <InfoText color={Colors.RED}>Password exposed {exposed} times</InfoText>
          ))}
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

interface InfoTextProps {
  color: string;
}

const InfoText = styled.p<InfoTextProps>`
  font-size: 1rem;
  color: ${({ color }) => color};
`;

const Form = styled.form`
  width: 100%;
  text-align: center;
`;

const ButtonContainer = styled.div`
  margin: 20px 0;
  text-align: center;
`;

export default Exposed;
