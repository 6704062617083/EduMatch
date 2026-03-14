export const registerOtpStore: Record<
  string,
  { otp: string; expiresAt: number; data: any }
> = {};

export const forgotOtpStore: Record<
  string,
  { otp: string; expiresAt: number }
> = {};