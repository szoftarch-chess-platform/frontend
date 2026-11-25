import { Alert, Button, Link, Stack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';
import { useBackend } from '../api/backend-context';
import { validateLogin } from '../auth/account-rules';
import { AuthFrame } from '../auth/AuthFrame';
import { FormField } from '../auth/FormField';
import { useAuthForm } from '../auth/useAuthForm';

export function LoginPage() {
  const { auth } = useBackend();
  const form = useAuthForm(
    { userName: '', password: '' },
    validateLogin,
    (values) => auth.login(values),
  );

  return (
    <AuthFrame
      title="Sign in"
      intro="Play live chess against another player or against Stockfish."
      footer={
        <>
          No account yet?{' '}
          <Link asChild color="hero.fg" fontWeight="semibold">
            <RouterLink to="/register">Register</RouterLink>
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
            errors={form.fieldErrors.userName}
          />
          <FormField
            label="Password"
            type="password"
            autoComplete="current-password"
            value={form.values.password}
            onChange={(value) => form.setValue('password', value)}
            errors={form.fieldErrors.password}
          />

          <Button
            type="submit"
            colorPalette="brand"
            size="lg"
            rounded="full"
            loading={form.isPending}
          >
            Sign in
          </Button>
        </Stack>
      </form>
    </AuthFrame>
  );
}
