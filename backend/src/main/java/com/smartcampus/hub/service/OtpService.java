package com.smartcampus.hub.service;

public interface OtpService {
    void generateAndSendOtp(String email);
    boolean verifyOtp(String email, String otpCode);
    void markOtpAsUsed(String email, String otpCode);
}
