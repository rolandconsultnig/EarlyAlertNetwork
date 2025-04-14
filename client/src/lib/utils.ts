import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "N/A";
  
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return format(date, "MMM d, yyyy h:mm a");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
}
