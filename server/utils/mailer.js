/**
 * 邮件发送工具 - nodemailer
 * 支持 QQ邮箱、163邮箱、Gmail 等主流 SMTP 服务
 */

const nodemailer = require('nodemailer');

// 根据环境变量创建传输器
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '465');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('邮件服务未配置，请在 .env 文件中配置 SMTP_HOST、SMTP_USER、SMTP_PASS');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465端口用SSL，其他用STARTTLS
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });
}

/**
 * 发送验证码邮件
 * @param {string} to - 收件人邮箱
 * @param {string} code - 6位验证码
 */
async function sendVerifyCode(to, code) {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const siteName = process.env.SITE_NAME || '论文助手';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #ec4899, #9333ea); padding: 32px 40px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
    .body { padding: 40px; }
    .body p { color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .code-box { background: linear-gradient(135deg, #fdf2f8, #f5f3ff); border: 2px solid #f0abfc; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .code { font-size: 42px; font-weight: 800; letter-spacing: 10px; color: #9333ea; font-family: 'Courier New', monospace; }
    .expire { color: #6b7280; font-size: 13px; margin: 8px 0 0; }
    .warning { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px 16px; color: #92400e; font-size: 13px; margin-top: 24px; }
    .footer { background: #f9fafb; padding: 20px 40px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #f3f4f6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ ${siteName}</h1>
      <p>邮箱验证码</p>
    </div>
    <div class="body">
      <p>您好！</p>
      <p>您正在注册 <strong>${siteName}</strong> 账户，请使用以下验证码完成注册：</p>
      <div class="code-box">
        <div class="code">${code}</div>
        <div class="expire">验证码有效期 <strong>10 分钟</strong></div>
      </div>
      <p>如果这不是您本人的操作，请忽略此邮件，您的账户依然安全。</p>
      <div class="warning">
        ⚠️ 请勿将验证码告知任何人，${siteName} 工作人员不会索要您的验证码。
      </div>
    </div>
    <div class="footer">
      此邮件由系统自动发送，请勿直接回复 &nbsp;·&nbsp; © ${new Date().getFullYear()} ${siteName}
    </div>
  </div>
</body>
</html>
  `.trim();

  await transporter.sendMail({
    from: `"${siteName}" <${from}>`,
    to,
    subject: `【${siteName}】您的注册验证码：${code}`,
    html
  });
}

module.exports = { sendVerifyCode };
