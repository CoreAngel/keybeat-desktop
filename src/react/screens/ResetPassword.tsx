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
import CredentialEntity from '../../libs/src/entities/credential';

interface ResetPasswordType {
  salt: string;
  password: string;
  newPassword: string;
  newPasswordLocal: string;
}

const ResetPassword = () => {
  const services = useContext(ServiceContext);
  const history = useHistory();
  const networkStatus = useNetworkStatus();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      oldPassword: '',
      password: '',
      repeatPassword: '',
    },
    validationSchema: Yup.object().shape({
      oldPassword: Yup.string().required('Password is required'),
      password: Yup.string().min(8, 'Password must be at least 8 characters long').required('Password is required'),
      repeatPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    onSubmit: ({ oldPassword, password }) => {
      if (!networkStatus) {
        return;
      }
      handleSubmit(oldPassword, password);
    },
  });

  const handleSubmit = async (oldPassword: string, password: string) => {
    setErrors([]);
    setLoading(true);
    try {
      const activeUser = await services.userService.getActiveUser();
      const hashedOldPassword = toHex(sha(oldPassword));
      const oldSalt = activeUser.salt;
      const passwordOldKey = pbkdf2(hashedOldPassword, oldSalt, 150000, 64);

      const hashedNewPassword = toHex(sha(password));
      const newSalt = generateSalt();
      const passwordNewKey = pbkdf2(hashedNewPassword, newSalt, 150000, 64);
      const passwordNewKeyLocal = pbkdf2(passwordNewKey, newSalt, 150000, 64);

      await resetPassword({
        salt: newSalt,
        password: passwordOldKey,
        newPassword: passwordNewKey,
        newPasswordLocal: passwordNewKeyLocal,
      });

      const encrypted = await rewriteData(hashedOldPassword, hashedNewPassword);
      await saveData(encrypted);
      history.push('/credentials', { id: null });
    } catch (e) {
      setErrors(e);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async ({ salt, password, newPassword, newPasswordLocal }: ResetPasswordType) => {
    const { name, login } = await services.userService.getActiveUser();
    const result = await services.apiService.resetPassword({
      salt,
      password,
      newPassword,
    });
    if (result.data.errors.length > 0) {
      throw result.data.errors;
    }
    await services.userService.createOrUpdate({ name, login, salt, hash: newPasswordLocal, active: true });
  };

  const rewriteData = async (oldHash: string, newHash: string) => {
    const { id, login: activeLogin } = await services.userService.getActiveUser();
    const credentials = await services.credentialService.getCredentials(id);

    await services.passwordService.setUserPassword(activeLogin, oldHash);
    const encrypted = await Promise.all(
      credentials.map(async ({ data, ...rest }) => {
        const { name, login, password } = await services.encryptionService.decryptCredential(data);
        const encryptedPassword = await services.encryptionService.decryptString(password);
        return {
          ...rest,
          name,
          login,
          password: encryptedPassword,
        };
      }),
    );

    await services.passwordService.setUserPassword(activeLogin, newHash);
    return Promise.all(
      encrypted.map(async ({ login, name, password, ...rest }) => {
        const encryptedPassword = await services.encryptionService.encryptString(password);
        const data = await services.encryptionService.encryptCredential({
          name,
          login,
          password: encryptedPassword,
        });
        return {
          ...rest,
          data,
        };
      }),
    );
  };

  const saveData = async (items: CredentialEntity[]) => {
    const itemsToSend = await Promise.all(
      items.map(async ({ id, data, uuid }) => {
        await services.credentialService.modifyCredential(id, data);
        return {
          id: uuid,
          data,
        };
      }),
    );

    const mappedItems = itemsToSend.filter(({ id }) => id);
    await services.apiService.modifyCredential(mappedItems);
  };

  return (
    <Container>
      <BackLink>
        <Header>Reset password</Header>
      </BackLink>
      {!networkStatus && <ErrorText>Reset Password only available in online mode</ErrorText>}
      <Form onSubmit={formik.handleSubmit}>
        <Input
          value={formik.values.oldPassword}
          errorString={extractFormErrors(formik, 'oldPassword')}
          label="Old password"
          name="oldPassword"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          type="password"
        />
        <Input
          value={formik.values.password}
          errorString={extractFormErrors(formik, 'password')}
          label="New password"
          name="password"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          type="password"
        />
        <Input
          value={formik.values.repeatPassword}
          errorString={extractFormErrors(formik, 'repeatPassword')}
          label="Confirm new password"
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

export default ResetPassword;
