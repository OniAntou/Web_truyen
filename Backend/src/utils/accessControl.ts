export type Principal = {
  id: string;
  role: "user" | "creator" | "admin";
};

export const isAdmin = (principal?: Principal) => principal?.role === "admin";

export const canManageComic = (principal: Principal | undefined, ownerId: unknown) =>
  isAdmin(principal) ||
  (principal?.role === "creator" && String(ownerId) === principal.id);

export const isCronAuthorized = (cronSecret: string | undefined, authHeader: string | undefined) =>
  Boolean(cronSecret) && authHeader === `Bearer ${cronSecret}`;
