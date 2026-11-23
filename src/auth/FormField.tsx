import { Box, Field, Input } from '@chakra-ui/react';
import { useState } from 'react';
import type { Requirement } from './account-rules';

type FormFieldProps = {
  label: string;
  type?: 'text' | 'email' | 'password';
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
  errors?: string[];
  requirements?: Requirement[];
  submitted?: boolean;
};

export function FormField({
  label,
  type = 'text',
  autoComplete,
  value,
  onChange,
  errors,
  requirements,
  submitted = false,
}: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const [left, setLeft] = useState(false);
  const showBroken = submitted || (left && value !== '');
  const shown = (requirements ?? []).filter(
    (rule) => focused || (showBroken && !rule.met(value)),
  );

  return (
    <Field.Root
      invalid={!!errors?.length || (!focused && showBroken && shown.length > 0)}
    >
      <Field.Label fontWeight="semibold">{label}</Field.Label>
      <Input
        type={type}
        autoComplete={autoComplete}
        value={value}
        size="lg"
        rounded="lg"
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setLeft(true);
        }}
      />
      {shown.length > 0 && (
        <Field.HelperText asChild>
          <Box as="ul" mt="1" ps="5" listStyleType="disc" fontSize="sm">
            {shown.map((rule) => {
              const met = rule.met(value);
              return (
                <Box
                  as="li"
                  key={rule.text}
                  color={met ? 'brand.fg' : 'fg.error'}
                >
                  <Box as="span" srOnly>
                    {met ? 'Met: ' : 'Not met: '}
                  </Box>
                  {rule.text}
                </Box>
              );
            })}
          </Box>
        </Field.HelperText>
      )}
      <Field.ErrorText>{errors?.join(' ')}</Field.ErrorText>
    </Field.Root>
  );
}
