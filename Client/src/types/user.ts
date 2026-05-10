export interface User {
    id: string;
    _id?: string;
    username: string;
    email: string;
    role?: 'user' | 'creator' | 'admin';
    avatar?: string;
    avatar_url?: string;
    balance?: number;
    coins?: number;
    is_vip?: boolean;
    vip_expiry?: string;
}
