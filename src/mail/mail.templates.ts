export function welcomeEmailHtml(firstName: string): string {
  return `
    <p>Hi ${escapeHtml(firstName)},</p>
    <p>Welcome to Hyeameha — your registration was successful.</p>
    <p>You can now sign in and explore events.</p>
    <p>Thanks,<br/>The Hyeameha Team</p>
  `.trim();
}

export function loginAlertEmailHtml(
  firstName: string,
  locationSummary: string,
): string {
  return `
    <p>Hi ${escapeHtml(firstName)},</p>
    <p>We noticed a new sign-in to your Hyeameha account.</p>
    <p><strong>Location / device:</strong> ${escapeHtml(locationSummary)}</p>
    <p>If this was you, no action is needed.</p>
    <p>If this was <strong>not</strong> you, sign in immediately and reset your password using
    <strong>Forgot password</strong> on the app, or call support.</p>
    <p>Thanks,<br/>The Hyeameha Team</p>
  `.trim();
}

export function passwordResetOtpEmailHtml(
  firstName: string,
  otp: string,
  expiresMinutes: number,
): string {
  return `
    <p>Hi ${escapeHtml(firstName)},</p>
    <p>Use the one-time code below to reset your password:</p>
    <p style="font-size:24px;font-weight:bold;letter-spacing:4px">${escapeHtml(otp)}</p>
    <p>This code expires in ${expiresMinutes} minutes.</p>
    <p>If you did not request a password reset, you can ignore this email.</p>
    <p>Thanks,<br/>The Hyeameha Team</p>
  `.trim();
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
