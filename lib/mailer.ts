import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendResetPasswordEmail(to: string, token: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/createNewPassword?token=${token}`;

  await transporter.sendMail({
    from: `"ReuseID Support" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Reset Password ReuseID",
    html: `
        <p>Kamu meminta reset password.</p>
      <p>Klik link berikut untuk melanjutkan (berlaku 1 jam):</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Abaikan email ini jika kamu tidak merasa meminta reset password.</p>
        `,
  });
}
