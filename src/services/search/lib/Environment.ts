export const getVariable =
  (name: string): string => process.env[name] || '';
