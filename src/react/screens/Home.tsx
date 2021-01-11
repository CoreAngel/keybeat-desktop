import React, { useContext, useEffect, useState } from 'react';
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
import SmallText from '../components/SmallText';
import UserEntity from '../../libs/src/entities/user';
import SecondaryButton from '../components/SecondaryButton';
import { toHex } from '../../libs/src/functions/utils';
import UsersList from '../components/UsersList';
import { Colors } from '../utils/colors';
import useNetworkStatus from '../hooks/useNetworkStatus';
import LinkButton from '../components/LinkButton';

const Home = () => {
  const services = useContext(ServiceContext);
  const history = useHistory();
  const networkStatus = useNetworkStatus();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [activeUser, setActiveUser] = useState<UserEntity | null>(null);
  const formik = useFormik({
    initialValues: {
      isOnline: networkStatus,
      password: '',
      token: '',
    },
    validationSchema: Yup.object().shape({
      isOnline: Yup.boolean(),
      password: Yup.string().required('Password is required'),
      token: Yup.string().when('isOnline', {
        is: true,
        then: Yup.string()
          .required('Token must have 6 characters long')
          .length(6, 'Token must have 6 characters long')
          .matches(/^\d+$/, 'Token can contain only digits'),
      }),
    }),
    onSubmit: ({ password, token }) => {
      handleSubmit(activeUser, password, token);
    },
  });

  useEffect(() => {
    formik.setValues({
      ...formik.values,
      isOnline: networkStatus,
    });
  }, [networkStatus]);

  useEffect(() => {
    (async () => {
      const foundUsers = await services.userService.getUsers();
      const foundActiveUser = await services.userService.getActiveUser();
      setUsers(foundUsers);
      setActiveUser(foundActiveUser);
      setLoading(false);
    })();
  }, [services.userService]);

  const handleSubmit = async (user: UserEntity, password: string, token: string) => {
    setErrors([]);
    setLoading(true);
    try {
      const { salt, login } = user;
      const hashedPassword = toHex(sha(password));
      const passwordKey = pbkdf2(hashedPassword, salt, 150000, 64);
      const passwordKeyLocal = pbkdf2(passwordKey, salt, 150000, 64);
      if (networkStatus) {
        const { auth } = await loginToApi(login, passwordKey, token);
        await services.userService.changePassword({ ...user, hash: passwordKey });
        services.tokenService.setToken(auth);
        services.networkService.setUserStatus(true);
        await services.synchronizationService.synchronize(user.id, user.lastSynchronize);
      } else {
        loginToLocal(user, passwordKeyLocal);
        services.tokenService.setToken('');
        services.networkService.setUserStatus(false);
      }
      await services.passwordService.setUserPassword(login, hashedPassword);
      history.push('/credentials/read', {
        id: null,
      });
    } catch (e) {
      setErrors(e);
    } finally {
      setLoading(false);
    }
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

  const loginToLocal = (user: UserEntity, password: string) => {
    if (user.hash === password) {
      throw ['Wrong credentials provided'];
    }
  };

  const handleDelete = async (user: UserEntity) => {
    await services.userService.deleteUser(user);
    await services.credentialService.deleteCredentials(user.id);
    await services.actionService.deleteUserActions(user.id);
    setUsers(users.filter(({ id }) => user.id !== id));
    if (user.active) {
      setActiveUser(null);
    }
  };

  const handleSetActive = async (user: UserEntity) => {
    await services.userService.setActiveUser(user);
    setActiveUser(user);
  };

  return (
    <Container>
      <Header>KeyBeat</Header>
      <SmallText>You are in {formik.values.isOnline ? 'online' : 'offline'} mode</SmallText>
      {users.length === 0 && !loading && (
        <SmallText>No accounts available. Go to add account or register page.</SmallText>
      )}
      {users.length !== 0 && !activeUser && !loading && (
        <SmallText>Select the account you want to log in to.</SmallText>
      )}
      {users.length !== 0 && <UsersList users={users} onSetActive={handleSetActive} onDelete={handleDelete} />}
      {!!activeUser && (
        <Form onSubmit={formik.handleSubmit}>
          <User>{activeUser.name}</User>
          <Input
            value={formik.values.password}
            errorString={extractFormErrors(formik, 'password')}
            label="Password"
            name="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            type="password"
          />
          {formik.values.isOnline && (
            <Input
              value={formik.values.token}
              errorString={extractFormErrors(formik, 'token')}
              label="Token"
              name="token"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              type="text"
            />
          )}
          <Button type="submit" disabled={loading || !formik.isValid || !formik.dirty}>
            {loading ? <Spinner /> : 'Login'}
          </Button>
          {errors.map((error) => (
            <ErrorText key={error}>{error}</ErrorText>
          ))}
        </Form>
      )}
      <ButtonsContainer>
        <SecondaryButton onClick={() => history.push('/register')}>Register</SecondaryButton>
        <SecondaryButton onClick={() => history.push('/login')}>Add account</SecondaryButton>
      </ButtonsContainer>
      <LinkButton onClick={() => history.push('/reset/2fa')}>Reset authenticator</LinkButton>
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

const User = styled.p`
  color: ${Colors.WHITE};
  font-size: 1.3rem;
  margin: 5px;
  text-align: center;
  text-transform: none;
`;

const Form = styled.form`
  width: 100%;
  text-align: center;
`;

const ButtonsContainer = styled.div`
  margin: 20px 0;
  text-align: center;
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

export default Home;
