export interface Genre {
    _id?: string;
    id?: string;
    name: string;
}

export interface Chapter {
    id: string;
    _id?: string;
    chapter_number: number;
    title?: string;
    created_at?: string;
    date?: string;
    price?: number;
    is_locked?: boolean;
    early_access_end_date?: string;
    pages?: ChapterPage[];
}

export interface ChapterPage {
    image_url: string;
}

export interface Comic {
    id: string;
    _id?: string;
    title: string;
    cover_url?: string;
    cover?: string;
    rating?: number | string;
    views?: number | string;
    created_at?: string;
    chapter_count?: number;
    chapters?: Chapter[];
    description?: string;
    genres?: (string | Genre)[];
    status?: string;
    author?: string;
    weekly_views?: number;
}

export interface ReadingProgress {
    chapter_id: string;
    chapter_number: number;
    page_number?: number;
    hasProgress?: boolean;
}

export interface Pagination {
    page: number;
    totalPages: number;
    total: number;
}
