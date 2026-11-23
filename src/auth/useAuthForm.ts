import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import type { CurrentUser, FieldErrors } from '../api/types/platform';
import { hasErrors } from './account-rules';
import { currentUserQueryKey } from './current-user';
import { toFormErrors, type FormErrors } from './form-errors';

/**
 * The state of the sign-in and the registration form. The fields are checked on submit and,
 * after the first submit, on every change. A signed-in user lands in the cache, and the guards
 * then open the lobby.
 */
export function useAuthForm<Values extends Record<string, string>>(
  initialValues: Values,
  validate: (values: Values) => FieldErrors,
  submit: (values: Values) => Promise<CurrentUser>,
) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState(initialValues);
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<FormErrors>({ fields: {} });

  const mutation = useMutation({
    mutationFn: submit,
    onSuccess: (user) => queryClient.setQueryData(currentUserQueryKey, user),
    onError: (error) =>
      setServerErrors(toFormErrors(error, Object.keys(initialValues))),
  });

  const fieldErrors: FieldErrors = {
    ...serverErrors.fields,
    ...(submitted ? validate(values) : {}),
  };

  function setValue(field: keyof Values & string, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setServerErrors((current) => {
      const fields = { ...current.fields };
      delete fields[field];
      return { fields };
    });
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setServerErrors({ fields: {} });
    if (!hasErrors(validate(values))) {
      mutation.mutate(values);
    }
  }

  return {
    values,
    setValue,
    fieldErrors,
    serverFieldErrors: serverErrors.fields,
    submitted,
    message: serverErrors.message,
    isPending: mutation.isPending,
    onSubmit,
  };
}
