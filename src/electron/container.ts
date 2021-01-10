// import { createConnection } from 'typeorm';
// import path from 'path';
// import UserEntity from '../libs/src/entities/user';
// import CredentialEntity from '../libs/src/entities/credential';
// import ActionEntity from '../libs/src/entities/action';
// import UserService from '../libs/src/services/userService';
// import CredentialService from '../libs/src/services/credentialService';
// import ActionService from '../libs/src/services/actionService';
//
// export interface ContainerType {
//   userService: UserService;
//   credentialService: CredentialService;
//   actionService: ActionService;
// }
//
// export default class Container {
//   private static INSTANCE: Container | null = null;
//   private static APP_PATH = '';
//
//   private userService: UserService | null;
//   private credentialService: CredentialService | null;
//   private actionService: ActionService | null;
//
//   public static getContainer = async (): Promise<ContainerType> => {
//     const { userService, actionService, credentialService } = await Container.getInstance();
//     return {
//       userService,
//       actionService,
//       credentialService,
//     } as ContainerType;
//   };
//
//   public static initInstance = async (appDataPath: string) => {
//     Container.APP_PATH = appDataPath;
//     if (!Container.INSTANCE) {
//       Container.INSTANCE = new Container();
//       await Container.INSTANCE.init();
//     }
//   };
//
//   private static getInstance = async () => {
//     if (!Container.INSTANCE) {
//       throw 'Service container not initialized';
//     }
//     return Container.INSTANCE;
//   };
//
//   public init = async () => {
//     const connection = await this.connectToDB();
//     this.userService = new UserService(connection);
//     this.credentialService = new CredentialService(connection);
//     this.actionService = new ActionService(connection);
//   };
//
//   private connectToDB = async () => {
//     const dbPath = path.join(Container.APP_PATH, 'KeyBeat/db.sqlite');
//     return createConnection({
//       type: 'better-sqlite3',
//       database: dbPath,
//       synchronize: true,
//       logging: false,
//       entities: [UserEntity, CredentialEntity, ActionEntity],
//     });
//   };
// }
