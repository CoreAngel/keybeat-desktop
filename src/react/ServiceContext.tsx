import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { remote } from 'electron';
import { Connection, createConnection, getConnection } from 'typeorm';
import path from 'path';
import TokenService from '../libs/src/services/tokenService';
import ApiService from '../libs/src/services/apiService';
import ClipboardService from '../libs/src/services/clipboardService';
import ExposedService from '../libs/src/services/exposedPasswordService';
import GeneratorService from '../libs/src/services/passwordGeneratorService';
import NetworkService from './services/networkService';
import ActivityService from './services/activityService';
import CommunicationService from './services/communicationService';
import UserEntity from '../libs/src/entities/user';
import CredentialEntity from '../libs/src/entities/credential';
import ActionEntity from '../libs/src/entities/action';
import UserService from '../libs/src/services/userService';
import CredentialService from '../libs/src/services/credentialService';
import ActionService from '../libs/src/services/actionService';
import { fromBase64 } from '../libs/src/functions/utils';
import { pubKeyFromPem } from '../libs/src/functions/crypto';
import PasswordService from './services/passwordService';
import SynchronizationService from '../libs/src/services/synchronizationService';
import EncryptionService from './services/encryptionService';

const baseUrl = process.env.KEYBEAT_SERVER;
const publicRsaKey = pubKeyFromPem(fromBase64(process.env.KEYBEAT_PUBLIC_KEY));

const tokenService = new TokenService();
const apiService = new ApiService(tokenService, baseUrl, publicRsaKey);
const clipboardService = new ClipboardService();
const exposedService = new ExposedService();
const generatorService = new GeneratorService();
const networkService = new NetworkService();
const activityService = new ActivityService();
const communicationService = new CommunicationService();
const passwordService = new PasswordService();
const encryptionService = new EncryptionService(passwordService);

interface ServiceProviderProps {
  children: (loading: boolean) => ReactNode;
}

interface ServiceValueType {
  tokenService: TokenService;
  apiService: ApiService;
  clipboardService: ClipboardService;
  exposedService: ExposedService;
  generatorService: GeneratorService;
  networkService: NetworkService;
  activityService: ActivityService;
  communicationService: CommunicationService;
  userService: UserService;
  credentialService: CredentialService;
  actionService: ActionService;
  passwordService: PasswordService;
  synchronizationService: SynchronizationService;
  encryptionService: EncryptionService;
}

export const ServiceContext = createContext<ServiceValueType>(null);

const ServiceProvider = ({ children }: ServiceProviderProps) => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState({
    tokenService,
    apiService,
    clipboardService,
    exposedService,
    generatorService,
    networkService,
    activityService,
    communicationService,
    passwordService,
    encryptionService,
  });

  useEffect(() => {
    const initDb = async () => {
      const appDataPath = remote.app.getPath('appData');
      let connection: Connection;
      try {
        connection = getConnection();
      } catch (e) {
        connection = await createConnection({
          type: 'better-sqlite3',
          database: path.join(appDataPath, 'KeyBeat/db.sqlite'),
          synchronize: true,
          logging: false,
          entities: [UserEntity, CredentialEntity, ActionEntity],
        });
      }

      const userService = new UserService(connection);
      const credentialService = new CredentialService(connection);
      const actionService = new ActionService(connection);
      const synchronizationService = new SynchronizationService(
        userService,
        credentialService,
        actionService,
        apiService,
      );

      setServices((state) => ({
        ...state,
        userService,
        credentialService,
        actionService,
        synchronizationService,
      }));
      setLoading(false);
    };

    initDb();
  }, []);

  return <ServiceContext.Provider value={services as ServiceValueType}>{children(loading)}</ServiceContext.Provider>;
};

export default ServiceProvider;
