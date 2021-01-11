import { useContext, useEffect, useState } from 'react';
import { ServiceContext } from '../ServiceContext';

const useNetworkStatus = () => {
  const services = useContext(ServiceContext);
  const [networkStatus, setNetworkStatus] = useState(services.networkService.checkNetworkStatus());

  useEffect(() => {
    const subscription = services.networkService.onNetworkStateChange().subscribe(setNetworkStatus);
    return () => subscription.unsubscribe();
  }, [services.networkService]);

  return networkStatus;
};

export default useNetworkStatus;
