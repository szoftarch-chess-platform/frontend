import { Field, Input } from '@chakra-ui/react';

type FormFieldProps = {
  label: string;
  type?: 'text' | 'email' | 'password';
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
  errors?: string[];
};

export function FormField({
  label,
  type = 'text',
  autoComplete,
  value,
  onChange,
  errors,
}: FormFieldProps) {
  return (
    <Field.Root invalid={!!errors?.length}>
      <Field.Label>{label}</Field.Label>
      <Input
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <Field.ErrorText>{errors?.join(' ')}</Field.ErrorText>
    </Field.Root>
  );
}
