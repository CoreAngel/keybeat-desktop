import { FormikValues } from 'formik';

export const extractFormErrors = (formik: FormikValues, key: string) => {
  return formik.touched[key] ? formik.errors[key] : null;
};
