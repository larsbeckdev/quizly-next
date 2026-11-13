/** A route segment that is not a positive integer is a 404, not a request. */
export function parseQuizId(segment: string): number | null {
  const id = Number(segment)
  return Number.isInteger(id) && id > 0 ? id : null
}
