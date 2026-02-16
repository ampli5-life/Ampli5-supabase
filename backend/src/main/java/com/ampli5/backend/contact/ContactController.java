package com.ampli5.backend.contact;

import jakarta.mail.MessagingException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactController {

    private final ContactMailService mailService;

    public ContactController(ContactMailService mailService) {
        this.mailService = mailService;
    }

    @PostMapping
    public ResponseEntity<?> submit(@RequestBody Map<String, String> body) {
        String name = body != null ? (body.get("name") != null ? body.get("name").trim() : "") : "";
        String email = body != null ? (body.get("email") != null ? body.get("email").trim() : "") : "";
        String message = body != null ? (body.get("message") != null ? body.get("message").trim() : "") : "";

        if (name.isEmpty() || email.isEmpty() || message.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Name, email, and message are required."));
        }

        try {
            mailService.sendContactMessage(name, email, message);
            return ResponseEntity.ok(Map.of("message", "Message sent successfully."));
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to send message. Please try again later."));
        }
    }
}
