/**
 * GreenClaim Lens - Cloudflare Turnstile Verification
 */

export interface TurnstileVerificationResult {
  success: boolean;
  error?: string | undefined;
}

export async function verifyTurnstileToken(
  token: string | undefined,
  secretKey: string | undefined,
  remoteIp?: string | undefined,
): Promise<TurnstileVerificationResult> {
  // If no secret key is configured, bypass Turnstile (e.g. dev/test mode)
  if (!secretKey) {
    return { success: true };
  }

  if (!token) {
    return { success: false, error: 'Missing turnstile token' };
  }

  // Cloudflare test tokens
  if (token === '1x00000000000000000000AA') {
    return { success: true };
  }
  if (token === '2x00000000000000000000AB') {
    return { success: false, error: 'Token rejected by test secret' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!res.ok) {
      return { success: false, error: `Turnstile API responded with status ${res.status}` };
    }

    const outcome = (await res.json()) as { success: boolean; 'error-codes'?: string[] };
    if (!outcome.success) {
      return {
        success: false,
        error: outcome['error-codes']?.join(', ') ?? 'Turnstile verification failed',
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: `Turnstile verification request failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
