export interface BrowserUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export function buildUserAuthResponse(message: string, user: BrowserUser) {
  return { message, user };
}

export function buildAdminAuthResponse(message: string, username: string) {
  return { message, admin: { username } };
}
