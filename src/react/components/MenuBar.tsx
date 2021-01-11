import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { CgLastpass } from 'react-icons/cg';
import { BsShield } from 'react-icons/bs';
import { GiCrackedShield } from 'react-icons/gi';
import { IoKey } from 'react-icons/io5';
import { Colors } from '../utils/colors';
import LinkButton from './LinkButton';
import { AutotypeTypes } from '../services/autoTypeService';
import { ServiceContext } from '../ServiceContext';

const MenuBar = () => {
  const history = useHistory();
  const services = useContext(ServiceContext);
  const [autoType, setAutoType] = useState(AutotypeTypes.NORMAL);
  const [isAuthorized, setAuthorized] = useState(services.tokenService.getToken() !== null);

  useEffect(() => {
    const subscription = services.tokenService.getObservable().subscribe((val) => setAuthorized(val !== null));
    return () => subscription.unsubscribe();
  }, [services]);

  const handleAutoType = () => {
    const nextType = autoType === AutotypeTypes.NORMAL ? AutotypeTypes.TWO_CHANNEL : AutotypeTypes.NORMAL;
    services.communicationService.setAutoTypeType({ type: nextType });
    setAutoType(nextType);
  };

  return (
    <Container>
      <Wrapper>
        {isAuthorized && (
          <LinkButton title="Reset password" onClick={() => history.push('/reset/password')}>
            <CgLastpass />
          </LinkButton>
        )}
      </Wrapper>
      <Wrapper>
        <LinkButton title="Two channel autotype" onClick={handleAutoType}>
          <TwoChannelIcon activeIcon={autoType === AutotypeTypes.TWO_CHANNEL} />
        </LinkButton>
        <LinkButton title="Check if the password is exposed" onClick={() => history.push('/exposed')}>
          <GiCrackedShield />
        </LinkButton>
        <LinkButton title="Generate password" onClick={() => history.push('/generate')}>
          <IoKey />
        </LinkButton>
      </Wrapper>
      <Wrapper>
        {isAuthorized && (
          <LinkButton title="logout" onClick={() => history.push('/logout')}>
            <FiLogOut />
          </LinkButton>
        )}
      </Wrapper>
    </Container>
  );
};

const Container = styled.div`
  padding: 5px;
  background: ${Colors.DARKER};
  border-bottom: 2px solid ${Colors.WHITE70};
  display: flex;
  justify-content: space-between;
`;

interface TwoChannelIconProps {
  activeIcon: boolean;
}

const TwoChannelIcon = styled(({ activeIcon, ...rest }) => <BsShield {...rest} />)<TwoChannelIconProps>`
  color: ${({ activeIcon }) => (activeIcon ? Colors.PRIMARY : Colors.WHITE)};
`;

const Wrapper = styled.div``;

export default MenuBar;
