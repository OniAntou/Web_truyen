export const formatViews = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined) return '0';
  let n = typeof num === 'string' ? parseInt(num, 10) || 0 : num;
  
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
};

export const translateStatus = (status: string): string => {
  const map: Record<string, string> = {
    'Ongoing': 'Đang tiến hành',
    'Completed': 'Hoàn thành',
    'Hiatus': 'Tạm ngưng',
  };
  return map[status] || status;
};

export const slugify = (text: string): string => {
  return text
    .toString()
    .normalize('NFD')                   // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '')   // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')              // replace spaces with -
    .replace(/[^\w-]+/g, '')           // remove all non-word chars
    .replace(/--+/g, '-');             // replace multiple - with single -
};
