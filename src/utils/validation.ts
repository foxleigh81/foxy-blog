export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  // Username must be between 3 and 30 characters
  if (username.length < 3 || username.length > 30) {
    return {
      isValid: false,
      error: 'Username must be between 3 and 30 characters',
    };
  }

  // Username can only contain letters, numbers, and underscores
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, and underscores',
    };
  }

  return { isValid: true };
};
