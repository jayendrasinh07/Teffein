export const PASSWORD_REQUIREMENTS = 'Use at least 10 characters with a letter and a number.';

export const getPasswordPolicyError = (password: string): string | null => {
  if (password.length < 10 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return PASSWORD_REQUIREMENTS;
  }
  return null;
};

