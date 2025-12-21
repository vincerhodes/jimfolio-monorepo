import { format, formatDistanceStrict } from "date-fns";

export function formatIsoDate(iso: string): string {
  return format(new Date(iso), "yyyy-MM-dd HH:mm");
}

export function fromNow(iso: string, now = new Date()): string {
  return formatDistanceStrict(new Date(iso), now, { addSuffix: true });
}
