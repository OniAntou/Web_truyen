const parsePositiveInteger = (value: unknown, fallback: number, maximum: number) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
};

const MAX_PAGE = 10_000;

const getPagination = (
  pageValue: unknown,
  limitValue: unknown,
  defaultLimit: number,
  maximumLimit: number,
) => {
  const page = parsePositiveInteger(pageValue, 1, MAX_PAGE);
  const limit = parsePositiveInteger(limitValue, defaultLimit, maximumLimit);
  return { page, limit, skip: (page - 1) * limit };
};

export { getPagination };
