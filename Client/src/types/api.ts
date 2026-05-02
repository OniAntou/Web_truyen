/** Common error shape returned by the API */
export interface ApiError {
    message: string;
    is_locked?: boolean;
    type?: string;
    price?: number;
    early_access_end_date?: string;
    comic?: unknown;
    [key: string]: unknown;
}

/** Shape for report submissions */
export interface ReportData {
    target_type: 'chapter' | 'comment';
    target_id: string;
    reason: string;
    detail?: string;
}

/** Shape for admin report query params */
export interface AdminReportParams {
    page?: number;
    status?: string;
    type?: string;
    limit?: number;
}
