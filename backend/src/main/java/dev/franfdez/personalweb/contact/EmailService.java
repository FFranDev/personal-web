package dev.franfdez.personalweb.contact;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String ownerEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendContactEmail(ContactRequestDto request) {
        SimpleMailMessage mail = new SimpleMailMessage();
        
        mail.setFrom(ownerEmail);
        mail.setTo(ownerEmail);
        mail.setReplyTo(request.email());
        mail.setSubject("[Portfolio Contact] " + request.subject());
        
        String body = String.format(
                "Name: %s\nEmail: %s\n\nMessage:\n%s",
                request.name(),
                request.email(),
                request.message()
        );
        mail.setText(body);

        mailSender.send(mail);
    }
}