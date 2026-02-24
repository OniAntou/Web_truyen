export const formatViews = (num) => {
  if (num === null || num === undefined) return '0';
  if (typeof num === 'string') {
    num = parseInt(num, 10) || 0;
  }
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};
