import React, { useContext, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Switch, Route, useHistory, useLocation, MemoryRouter } from 'react-router-dom';
import ServiceContextProvider, { ServiceContext } from './ServiceContext';
import Register from './screens/Register';
import TwoFA from './screens/TwoFA';
import Login from './screens/Login';
import Spinner from './components/Spinner';
import Home from './screens/Home';
import { Colors } from './utils/colors';
import ResetTwoFa from './screens/ResetTwoFA';
import Credentials from './screens/Credentials';
import Logout from './screens/Logout';
import Exposed from './screens/Exposed';
import Generator from './screens/Generator';
import ResetPassword from './screens/ResetPassword';
import MenuBar from './components/MenuBar';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@500&family=Roboto:wght@300;400;500;700&display=swap');

  body {
    margin: 0;
  }

  * {
    font-family: Roboto, sans-serif;
    box-sizing: border-box;
  }

  *::-webkit-scrollbar {
    width: 6px;
    background-color: ${Colors.DARK};
  }

  *::-webkit-scrollbar-thumb {
    background: ${Colors.WHITE70};
  }
`;

export default function App() {
  return (
    <Container>
      <GlobalStyle />
      <ServiceContextProvider>
        {(loading) =>
          loading ? (
            <SpinnerContainer>
              <Spinner size={64} />
            </SpinnerContainer>
          ) : (
            <MemoryRouter>
              <MenuBar />
              <MainWindow />
            </MemoryRouter>
          )
        }
      </ServiceContextProvider>
    </Container>
  );
}

const MainWindow = () => {
  const services = useContext(ServiceContext);
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    services.activityService.start();
  }, [services]);

  useEffect(() => {
    const subscription = services.activityService.onInteractive().subscribe(() => {
      if (location.pathname !== '/') {
        history.push('/logout');
      }
    });
    return () => subscription.unsubscribe();
  }, [services, history, location]);

  return (
    <Switch>
      <Route exact path="/register" component={Register} />
      <Route exact path="/login" component={Login} />
      <Route exact path="/2fa" component={TwoFA} />
      <Route exact path="/reset/password" component={ResetPassword} />
      <Route exact path="/reset/2fa" component={ResetTwoFa} />
      <Route exact path="/logout" component={Logout} />
      <Route exact path="/exposed" component={Exposed} />
      <Route exact path="/generate" component={Generator} />
      <Route path="/credentials" component={Credentials} />
      <Route path="/" component={Home} />
    </Switch>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
`;

const SpinnerContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
