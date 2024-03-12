export const ogSafe = (str: string): string =>
  str.replace(/[&<>"']/g, '').replace(/\n/g, ' ');
