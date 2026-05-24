import { Request } from "express";
import { AuditLog } from "../database";

/**
 * Ghi log hành động của người dùng (thường là Admin/Creator)
 * @param req Request của Express (để lấy user_id và ip)
 * @param action Tên hành động (vd: 'CREATE_COMIC', 'DELETE_USER')
 * @param targetType Loại đối tượng bị tác động (vd: 'Comic', 'User')
 * @param targetId ID của đối tượng bị tác động
 * @param details Dữ liệu chi tiết bổ sung (vd: tên truyện, thay đổi trước/sau)
 */
export const logAudit = async (
  req: Request,
  action: string,
  targetType: string,
  targetId: any = null,
  details: any = null
) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return; // Không có user thì không ghi log (tránh lỗi)

    let ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (Array.isArray(ipAddress)) ipAddress = ipAddress[0];

    await AuditLog.create({
      user_id: userId,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      ip_address: ipAddress,
    });
  } catch (error) {
    console.error("Lỗi khi ghi Audit Log:", error);
  }
};
