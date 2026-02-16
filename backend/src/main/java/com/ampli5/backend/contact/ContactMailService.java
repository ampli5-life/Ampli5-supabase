package com.ampli5.backend.contact;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class ContactMailService {

    private final JavaMailSender mailSender;
    private final String recipient;

    public ContactMailService(JavaMailSender mailSender,
                              @Value("${app.contact.recipient:ampli5inc@gmail.com}") String recipient) {
        this.mailSender = mailSender;
        this.recipient = recipient;
    }

    public void sendContactMessage(String name, String senderEmail, String message) throws MessagingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
        helper.setTo(recipient);
        helper.setSubject("[Ampli5 Contact] Message from " + name);
        helper.setText(
                "You received a message from the Ampli5 contact form.\n\n" +
                "Name: " + name + "\n" +
                "Email: " + senderEmail + "\n\n" +
                "Message:\n" + message,
                false
        );
        mailSender.send(mimeMessage);
    }
}
