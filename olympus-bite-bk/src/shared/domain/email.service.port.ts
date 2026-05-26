export const EMAIL_SERVICE = 'EMAIL_SERVICE';

export interface EmailServicePort {
  sendPasswordResetEmail(
    email: string,
    resetLink: string,
    userName: string,
  ): Promise<void>;
}
