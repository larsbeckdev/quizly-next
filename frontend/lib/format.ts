import { format, isValid, parseISO } from "date-fns"
import { de } from "date-fns/locale"

export function formatDate(value: string): string {
  const date = parseISO(value)
  return isValid(date) ? format(date, "dd.MM.yyyy", { locale: de }) : value
}

export function formatDateTime(value: string): string {
  const date = parseISO(value)
  return isValid(date) ? format(date, "dd.MM.yyyy, HH:mm", { locale: de }) : value
}
