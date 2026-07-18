import crypto from "crypto";
import qs from "qs";

/**
 * VNPay Utility - Rewritten to match VNPay official NodeJS demo exactly.
 * Key difference: uses qs.stringify with { encode: false } and a specific sortObject.
 */

function sortObject(obj: Record<string, string | number>) {
  const sorted: Record<string, string> = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[encodeURIComponent(key)] = encodeURIComponent(String(obj[key])).replace(/%20/g, "+");
  }
  return sorted;
}

interface PaymentUrlParams {
  amount: number;
  orderId: string;
  orderInfo: string;
  ipAddr: string;
  locale?: string;
  bankCode?: string;
}

function createPaymentUrl(params: PaymentUrlParams) {
  const tmnCode = process.env.VNP_TMN_CODE?.trim();
  const secretKey = process.env.VNP_HASH_SECRET?.trim();
  const vnpUrl = process.env.VNP_URL?.trim();
  const returnUrl = process.env.VNP_RETURN_URL?.trim();

  // Validate environment variables
  if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
    const missing: string[] = [];
    if (!tmnCode) missing.push("VNP_TMN_CODE");
    if (!secretKey) missing.push("VNP_HASH_SECRET");
    if (!vnpUrl) missing.push("VNP_URL");
    if (!returnUrl) missing.push("VNP_RETURN_URL");
    
    console.error(`[VNPay] Missing environment variables: ${missing.join(", ")}`);
    throw new Error(`Cấu hình VNPay chưa hoàn thiện. Thiếu: ${missing.join(", ")}`);
  }

  const date = new Date();
  const createDate = formatDate(date);

  let vnp_Params: Record<string, string | number> = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = params.locale || "vn";
  vnp_Params["vnp_CurrCode"] = "VND";
  vnp_Params["vnp_TxnRef"] = params.orderId;
  vnp_Params["vnp_OrderInfo"] = params.orderInfo;
  vnp_Params["vnp_OrderType"] = "other";
  vnp_Params["vnp_Amount"] = params.amount * 100;
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = params.ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;

  if (params.bankCode && params.bankCode !== "") {
    vnp_Params["vnp_BankCode"] = params.bankCode;
  }

  // Sort and hash
  vnp_Params = sortObject(vnp_Params);

  var signData = qs.stringify(vnp_Params, { encode: false });
  var hmac = crypto.createHmac("sha512", secretKey);
  var signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  vnp_Params["vnp_SecureHash"] = signed;

  const finalUrl = vnpUrl + "?" + qs.stringify(vnp_Params, { encode: false });
  
  // Log URL (with hash redacted for security)
  console.log(`[VNPay] Generated URL: ${finalUrl.replace(/vnp_SecureHash=[^&]+/, "vnp_SecureHash=REDACTED")}`);

  return finalUrl;
}

function verifyReturnUrl(vnp_Params: Record<string, string | number>) {
  const secretKey = process.env.VNP_HASH_SECRET?.trim();

  if (!secretKey) return false;

  let secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);

  var signData = qs.stringify(vnp_Params, { encode: false });
  var hmac = crypto.createHmac("sha512", secretKey);
  var signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  return secureHash === signed;
}

function formatDate(date: Date) {
  const pad = (n: number) => (n < 10 ? "0" + n : n);
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

export {  createPaymentUrl, verifyReturnUrl  };
