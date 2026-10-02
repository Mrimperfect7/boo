export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

/** Printed page numbers are always two digits: 08, not 8. */
export function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export function formatPageRange(left: number | null, right: number | null): string {
  if (left !== null && right !== null) return `${pad2(left)} — ${pad2(right)}`;
  if (left !== null) return pad2(left);
  if (right !== null) return pad2(right);
  return '—';
}
