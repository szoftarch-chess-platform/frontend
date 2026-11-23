import { Alert, Button, Link, Stack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';
import { useBackend } from '../api/backend-context';
import {
  REGISTRATION_RULES,
  validateRegistration,
} from '../auth/account-rules';
import { AuthFrame } from '../auth/AuthFrame';
import { FormField } from '../auth/FormField';
import { useAuthForm } from '../auth/useAuthForm';

export function RegisterPage() {
  const { auth } = useBackend();
  const form = useAuthForm(
    { userName: '', email: '', password: '' },
    validateRegistration,
    (values) => auth.register(values),
  );
  // The fields list their own rules, so only the errors of the server go under them.
  const errors = form.serverFieldErrors;

  return (
    <AuthFrame
      title="Register"
      intro="Your user name is what other players see in your games."
      footer={
        <>
          Already registered?{' '}
          <Link asChild color="hero.fg" fontWeight="semibold">
            <RouterLink to="/login">Sign in</RouterLink>
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={form.onSubmit}>
        <Stack gap="5">
          {form.message && (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Title>{form.message}</Alert.Title>
            </Alert.Root>
          )}

          <FormField
            label="User name"
            autoComplete="username"
            value={form.values.userName}
            onChange={(value) => form.setValue('userName', value)}
            errors={errors.userName}
            requirements={REGISTRATION_RULES.userName}
            submitted={form.submitted}
          />
          <FormField
            label="Email"
            type="email"
            autoComplete="email"
            value={form.values.email}
            onChange={(value) => form.setValue('email', value)}
            errors={errors.email}
            requirements={REGISTRATION_RULES.email}
            submitted={form.submitted}
          />
          <FormField
            label="Password"
            type="password"
            autoComplete="new-password"
            value={form.values.password}
            onChange={(value) => form.setValue('password', value)}
            errors={errors.password}
            requirements={REGISTRATION_RULES.password}
            submitted={form.submitted}
          />

          <Button
            type="submit"
            colorPalette="brand"
            size="lg"
            rounded="full"
            loading={form.isPending}
          >
            Register
          </Button>
        </Stack>
      </form>
    </AuthFrame>
  );
}
