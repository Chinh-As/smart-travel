package com.smarttravel.common.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for sending transactional emails via Gmail SMTP.
 * All send methods are {@code @Async} so they never block the HTTP response thread.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.otp.from-email}")
    private String fromEmail;

    @Value("${app.otp.from-name}")
    private String fromName;

    /**
     * Sends an OTP email to the user for password reset.
     *
     * @param toEmail recipient email address
     * @param otp     the 6-digit OTP code (plaintext, before hashing)
     */
    @Async
    public void sendOtpEmail(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("[Smart Travel] Mã xác minh đặt lại mật khẩu");
            helper.setText(buildOtpEmailHtml(otp), true); // true = HTML

            mailSender.send(message);
            log.info("OTP email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            // Not rethrown — failure is logged but must not crash the request thread
        }
    }

    // -------------------------------------------------------------------------
    // HTML template
    // -------------------------------------------------------------------------

    private String buildOtpEmailHtml(String otp) {
        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
                <body style="margin:0;padding:0;background:#f0f4ff;font-family:'Segoe UI',Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                    <tr><td align="center">
                      <table width="480" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:16px;overflow:hidden;">
                        <!-- Header -->
                        <tr><td style="background:linear-gradient(135deg,#6c63ff,#4facfe);padding:32px;text-align:center;">
                          <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:1px;">✈️ Smart Travel</h1>
                          <p style="margin:8px 0 0;color:rgba(255,255,255,.85);font-size:14px;">Khôi phục mật khẩu</p>
                        </td></tr>
                        <!-- Body -->
                        <tr><td style="padding:40px 36px;">
                          <p style="margin:0 0 16px;color:#c8c8e0;font-size:15px;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                          <p style="margin:0 0 24px;color:#c8c8e0;font-size:15px;">Mã xác minh của bạn là:</p>
                          <div style="background:#0f0f1a;border:2px solid #6c63ff;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
                            <span style="font-size:42px;font-weight:700;letter-spacing:12px;color:#4facfe;font-family:monospace;">%s</span>
                          </div>
                          <p style="margin:0 0 8px;color:#8888a0;font-size:13px;">⏱ Mã có hiệu lực trong <strong style="color:#c8c8e0;">10 phút</strong>.</p>
                          <p style="margin:0 0 24px;color:#8888a0;font-size:13px;">🔒 Không chia sẻ mã này với bất kỳ ai.</p>
                          <p style="margin:0;color:#8888a0;font-size:13px;">Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
                        </td></tr>
                        <!-- Footer -->
                        <tr><td style="padding:20px 36px;border-top:1px solid #2a2a3e;text-align:center;">
                          <p style="margin:0;color:#5a5a7a;font-size:12px;">© 2026 Smart Travel · Email tự động, vui lòng không phản hồi.</p>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(otp);
    }
}
