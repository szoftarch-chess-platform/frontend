import { Alert, Button, Heading, Link, Stack, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router';
import { useBackend } from '../api/backend-context';
import { validateRegistration } from '../auth/account-rules';
import { FormField } from '../auth/FormField';
import { useAuthForm } from '../auth/useAuthForm';

export function RegisterPage() {
  const { auth } = useBackend();
  const form = useAuthForm(
    { userName: '', email: '', password: '' },
    validateRegistration,
    (values) => auth.register(values),
  );

  return (
    <form noValidate onSubmit={form.onSubmit}>
      <Stack gap="4" maxW="sm">
        <Heading as="h1" size="xl">
          Register
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
          label="Email"
          type="email"
          autoComplete="email"
          value={form.values.email}
          onChange={(value) => form.setValue('email', value)}
          errors={form.fieldErrors.email}
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="new-password"
          value={form.values.password}
          onChange={(value) => form.setValue('password', value)}
          errors={form.fieldErrors.password}
        />

        <Button type="submit" colorPalette="brand" loading={form.isPending}>
          Register
        </Button>
        <Text>
          Already registered?{' '}
          <Link asChild colorPalette="brand">
            <RouterLink to="/login">Sign in</RouterLink>
          </Link>
        </Text>
      </Stack>
    </form>
  );
}
