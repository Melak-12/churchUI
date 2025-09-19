import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the ID from a MongoDB document, handling both _id and id fields
 * @param doc - Document that may have _id or id field
 * @returns The ID as a string
 */
export function getDocumentId(doc: any): string {
  return doc?.id || doc?._id || doc?.id?.toString() || doc?._id?.toString() || '';
}
