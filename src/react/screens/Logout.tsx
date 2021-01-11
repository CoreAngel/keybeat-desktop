import React, { useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { ServiceContext } from '../ServiceContext';

const Logout = () => {
  const services = useContext(ServiceContext);
  const userNetwork = services.networkService.getUserStatus();

  const logout = async () => {
    try {
      if (userNetwork) {
        await services.apiService.logout();
      }
      services.tokenService.clearToken();
    } catch (e) {
      // ignore
    }
  };

  logout();

  return <Redirect to="/" />;
};

export default Logout;
