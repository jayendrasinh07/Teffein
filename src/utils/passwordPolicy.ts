export const PASSWORD_REQUIREMENTS = 'Use at least 12 characters with uppercase, lowercase, number and symbol.';

export const getPasswordPolicyError = (password: string): string | null => {
  if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return PASSWORD_REQUIREMENTS;
  }
  return null;
};

