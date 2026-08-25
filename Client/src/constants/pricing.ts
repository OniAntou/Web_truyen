/**
 * Nguon duy nhat cho gia tri tra phi hien cho nguoi dung.
 * Moi noi hien thi gia (LockedChapterView, modal xac nhan...) doc tu day.
 */
export const VIP_PRICE_PER_MONTH_XU = 50000;

/** Dinh dang so Xu theo van phong tieng Viet (50.000). */
export const formatXu = (amount: number): string => amount.toLocaleString('vi-VN');
