import { Subject } from 'rxjs';

export default class NetworkService {
  private listener = new Subject<boolean>();
  private networkStatus: boolean;
  private userStatus: boolean;

  constructor() {
    this.networkStatus = navigator.onLine;

    window.addEventListener('online', () => {
      this.networkStatus = true;
      this.listener.next(true);
    });
    window.addEventListener('offline', () => {
      this.networkStatus = false;
      this.listener.next(false);
    });
  }

  public onNetworkStateChange = () => this.listener.asObservable();

  public checkNetworkStatus = () => this.networkStatus;

  public setUserStatus = (status) => {
    this.userStatus = status;
  };

  public getUserStatus = () => this.userStatus;
}
