import { useHistory } from 'react-router-dom';

interface State {
  id?: string;
}

const useCredentialId = (): string | undefined => {
  const history = useHistory();
  return (history.location?.state as State)?.id;
};

export default useCredentialId;
