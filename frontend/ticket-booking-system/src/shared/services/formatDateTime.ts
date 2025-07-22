export const formatTime = (time: string) => time.slice(0, 5);

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
  }
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}.${month}.${year}`;
}