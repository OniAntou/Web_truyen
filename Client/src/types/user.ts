export interface User {
    id: string;
    _id?: string;
    username: string;
    email: string;
    role?: 'user' | 'creator' | 'admin';
    avatar?: string;
    balance?: number;
    vip_expiry?: string;
}
