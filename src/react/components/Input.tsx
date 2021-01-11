import React from 'react';
import styled from 'styled-components';
import { TextField, TextFieldProps } from '@material-ui/core';
import { Colors } from '../utils/colors';

type Props = TextFieldProps & {
  errorString: string;
  label: string;
};

const Input = ({ errorString, label, ...rest }: Props) => {
  return (
    <Container>
      <InputStyled {...rest} label={label} error={!!errorString} variant="filled" />
      {errorString && <ErrorText>{errorString}</ErrorText>}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
`;

const ErrorText = styled.p`
  font-size: 0.8rem;
  color: #ff1811;
  margin: 0 10px;
  text-align: center;
`;

const InputStyled = styled<typeof TextField>(TextField)`
  && {
    font-size: 1.2rem;
    padding: 8px;
    margin-top: 10px;
    width: 100%;
    outline: none;

    & .MuiFormLabel-root {
      color: ${Colors.WHITE};

      &.Mui-error {
        color: ${Colors.RED};
      }
    }

    & .MuiInputBase-root {
      background-color: transparent;
      color: ${Colors.WHITE};

      &.Mui-error {
        color: ${Colors.RED};
      }

      &:before,
      &.MuiFilledInput-underline:not(.Mui-error):hover:before,
      &.MuiFilledInput-underline:not(.Mui-error):after {
        border-bottom-color: ${Colors.WHITE};
      }

      &.MuiFilledInput-underline:not(.Mui-error):after {
        border-bottom-color: ${Colors.PRIMARY};
      }
    }
  }
`;

export default Input;
