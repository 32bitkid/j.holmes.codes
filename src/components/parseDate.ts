import { parseISO } from "date-fns";

export const parseDate = (input: unknown): Date => {
  if (input instanceof Date) return input;
  if (typeof input === "string") return parseISO(input);
  if (typeof input === "number") return new Date(input);
  return new Date();
}