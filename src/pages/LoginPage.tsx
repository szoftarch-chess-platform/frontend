import { Alert, Button, Heading, Link, Stack, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';
import { useBackend } from '../api/backend-context';
import { validateLogin } from '../auth/account-rules';
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
    <form noValidate onSubmit={form.onSubmit}>
      <Stack gap="4" maxW="sm">
        <Heading as="h1" size="xl">
          Sign in
        </Heading>

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

        <Button type="submit" colorPalette="brand" loading={form.isPending}>
          Sign in
        </Button>
        <Text>
          No account yet?{' '}
          <Link asChild colorPalette="brand">
            <RouterLink to="/register">Register</RouterLink>
          </Link>
        </Text>
      </Stack>
    </form>
  );
}
