import { Injectable, OnModuleInit } from '@nestjs/common';
import { EmailServicePort } from '../../domain/email.service.port';

@Injectable()
export class ResendEmailAdapter implements EmailServicePort, OnModuleInit {
  private apiKey?: string;

  onModuleInit() {
    this.apiKey = process.env.RESEND_API_KEY;
    if (!this.apiKey) {
      console.warn(
        '⚠️ RESEND_API_KEY not set — password reset emails will be logged instead of sent',
      );
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetLink: string,
    userName: string,
  ): Promise<void> {
    if (!this.apiKey) {
      console.log(
        `[Email Mock] To: ${email}, Subject: Recuperar contraseña, Link: ${resetLink}`,
      );
      return;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from:
            process.env.EMAIL_FROM || 'Punto de Acceso <onboarding@resend.dev>',
          to: [email],
          subject: 'Recuperar contraseña - Punto de Acceso',
          html: `
            <div style="font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 32px; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; background-color: #0b0f19; color: #f8fafc; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
              <div style="display: inline-block; margin-bottom: 24px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); width: 56px; height: 56px; border-radius: 16px; line-height: 56px; text-align: center; box-shadow: 0 0 20px rgba(16,185,129,0.3);">
                <span style="font-size: 24px; font-weight: bold; color: #020617; font-family: monospace;">P</span>
              </div>
              <h2 style="color: #ffffff; text-align: center; text-transform: uppercase; font-size: 20px; font-weight: 800; letter-spacing: 0.15em; margin: 0 0 8px 0;">Punto de Inflexión</h2>
              <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #10b981; font-weight: 700; margin: 0 0 32px 0;">Rendimiento al Límite</p>
              
              <div style="text-align: left; background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                <p style="font-size: 16px; color: #ffffff; margin-top: 0; margin-bottom: 12px; font-weight: 600;">Hola, ${userName}</p>
                <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin: 0;">
                  Has solicitado restablecer tu contraseña. Para continuar con el proceso e ingresar tu nueva clave de acceso, haz clic en el siguiente enlace de recuperación:
                </p>
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetLink}" style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%); color: #020617; padding: 16px 32px; text-decoration: none; border-radius: 16px; font-weight: 800; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; box-shadow: 0 10px 25px rgba(16,185,129,0.25); transition: all 0.2s ease;">
                  Restablecer Contraseña
                </a>
              </div>

              <p style="font-size: 12px; color: #64748b; line-height: 1.6; margin-top: 32px;">
                Este enlace expira en una hora por motivos de seguridad. Si no has solicitado este cambio, puedes ignorar este correo sin problemas.
              </p>
              
              <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.06); margin: 32px 0 24px 0;" />
              
              <p style="font-size: 10px; color: #475569; letter-spacing: 0.1em; text-transform: uppercase; margin: 0;">
                Punto de Inflexión &copy; 2026
              </p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `❌ Failed to send email via Resend: ${response.status} - ${errorText}`,
        );
        throw new Error(`Email sending failed: ${errorText}`);
      }

      console.log(`✅ Password reset email sent successfully to ${email}`);
    } catch (err) {
      console.error('❌ Error sending password reset email:', err);
      throw err;
    }
  }
}
