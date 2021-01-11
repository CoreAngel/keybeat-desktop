import React, { useContext, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import { ServiceContext } from '../ServiceContext';
import ErrorText from '../components/ErrorText';
import Header from '../components/Header';
import BackLink from '../components/BackLink';
import Input from '../components/Input';
import Button from '../components/Button';
import { Colors } from '../utils/colors';
import { extractFormErrors } from '../utils/errors';

const Exposed = () => {
  const services = useContext(ServiceContext);
  const [password, setPassword] = useState<string>('');
  const { generatorService } = services;
  const config = generatorService.getConfig();
  const formik = useFormik({
    initialValues: {
      error: '',
      size: 20,
      ...config,
    },
    validationSchema: Yup.object({
      error: Yup.string(),
      size: Yup.number().min(8),
      lower: Yup.boolean(),
      upper: Yup.boolean(),
      numbers: Yup.boolean(),
      special: Yup.boolean(),
      latin1: Yup.boolean(),
    }).test('oneOfChecked', null, ({ latin1, lower, numbers, special, upper }) => {
      const values = [latin1, lower, numbers, special, upper];
      const checked = values.filter((val) => val);
      if (checked.length > 0) {
        return true;
      }

      return new Yup.ValidationError('Please check at least 1 checkbox', null, 'error');
    }),
    onSubmit: ({ error, size, ...configObject }) => {
      handleSubmit(size, configObject);
    },
  });

  const handleSubmit = async (size: number, configObject: any) => {
    generatorService.setConfig(configObject);
    const generatedPassword = generatorService.generate(size);
    setPassword(generatedPassword);
  };

  const truncate = (str: string): string => {
    if (str.length > 35) {
      return `${str.substr(0, 35)}...`;
    }
    return str;
  };

  return (
    <Container>
      <BackLink>
        <Header>Password generator</Header>
      </BackLink>
      <Form onSubmit={formik.handleSubmit}>
        <ControlLabel
          control={<StyledCheckbox checked={formik.values.lower} name="lower" onChange={formik.handleChange} />}
          label={`Lower (${truncate(generatorService.lower)})`}
        />
        <ControlLabel
          control={<StyledCheckbox checked={formik.values.upper} name="upper" onChange={formik.handleChange} />}
          label={`Upper (${truncate(generatorService.upper)})`}
        />
        <ControlLabel
          control={<StyledCheckbox checked={formik.values.numbers} name="numbers" onChange={formik.handleChange} />}
          label={`Digits (${truncate(generatorService.numbers)})`}
        />
        <ControlLabel
          control={<StyledCheckbox checked={formik.values.special} name="special" onChange={formik.handleChange} />}
          label={`Special (${truncate(generatorService.special)})`}
        />
        <ControlLabel
          control={<StyledCheckbox checked={formik.values.latin1} name="latin1" onChange={formik.handleChange} />}
          label={`Latin (${truncate(generatorService.latin1)})`}
        />
        <Input
          value={formik.values.size}
          errorString={extractFormErrors(formik, 'size')}
          label="Size"
          name="size"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          inputProps={{ min: '8', step: '1' }}
          type="number"
        />
        <Input value={password} errorString={null} label="Generated password" name="password" type="text" />
        <ButtonContainer>
          <Button type="submit" disabled={!formik.isValid}>
            Generate
          </Button>
        </ButtonContainer>
        {formik.errors.error && <ErrorText>{formik.errors.error}</ErrorText>}
      </Form>
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

const Form = styled.form`
  width: 100%;
  text-align: left;
  display: flex;
  flex-direction: column;
`;

const ButtonContainer = styled.div`
  margin: 20px 0;
  text-align: center;
`;

const StyledCheckbox = styled(Checkbox)`
  && {
    color: ${Colors.PRIMARY};

    &.MuiCheckbox-colorSecondary.Mui-checked {
      color: ${Colors.PRIMARY};
    }
  }
`;

const ControlLabel = styled(FormControlLabel)`
  color: ${Colors.WHITE};
`;

export default Exposed;
