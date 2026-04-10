package com.smartcampus.hub.service.impl;

import com.smartcampus.hub.entity.PasswordResetOtp;
import com.smartcampus.hub.repository.PasswordResetOtpRepository;
import com.smartcampus.hub.service.EmailService;
import com.smartcampus.hub.service.OtpService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpServiceImpl implements OtpService {

    private final PasswordResetOtpRepository otpRepository;
    private final EmailService emailService;
    private static final int OTP_EXPIRATION_MINUTES = 10;

    public OtpServiceImpl(PasswordResetOtpRepository otpRepository, EmailService emailService) {
        this.otpRepository = otpRepository;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public void generateAndSendOtp(String email) {
        String otpCode = String.format("%06d", new Random().nextInt(999999));

        PasswordResetOtp otp = PasswordResetOtp.builder()
                .email(email)
                .otpCode(otpCode)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES))
                .verified(false)
                .used(false)
                .build();

        otpRepository.save(otp);

        String subject = "Smart Campus Hub - Password Reset OTP";
        String body = "Hello,\n\n"
                + "You have requested to reset your password. Here is your 6-digit OTP code:\n\n"
                + "        " + otpCode + "\n\n"
                + "This securely generated code will strictly expire in 10 minutes. "
                + "If you did not request this OTP, please immediately ignore this email and secure your account.\n\n"
                + "Regards,\nSmart Campus Operations Team";

        emailService.sendEmail(email, subject, body);
    }

    @Override
    public boolean verifyOtp(String email, String otpCode) {
        Optional<PasswordResetOtp> otpOpt = otpRepository.findTopByEmailOrderByCreatedAtDesc(email);
        
        if (otpOpt.isEmpty()) {
            return false;
        }

        PasswordResetOtp otp = otpOpt.get();
        
        if (otp.isUsed() || otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }

        if (otp.getOtpCode().equals(otpCode)) {
            otp.setVerified(true);
            otpRepository.save(otp);
            return true;
        }
        
        return false;
    }

    @Override
    @Transactional
    public void markOtpAsUsed(String email, String otpCode) {
        otpRepository.findTopByEmailOrderByCreatedAtDesc(email).ifPresent(otp -> {
            if (otp.getOtpCode().equals(otpCode)) {
                otp.setUsed(true);
                otpRepository.save(otp);
            }
        });
    }
}
