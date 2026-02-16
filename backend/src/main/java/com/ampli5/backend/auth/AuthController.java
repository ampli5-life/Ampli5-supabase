package com.ampli5.backend.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final String googleClientId;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService,
                          @Value("${google.client-id}") String googleClientId) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.googleClientId = googleClientId;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail().trim().toLowerCase());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }
        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(LoginResponse.of(token, user));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("message", "An account with this email already exists"));
        }
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setAdmin(false);
        userRepository.save(user);
        String token = jwtService.generateToken(user);
        return ResponseEntity.status(201).body(LoginResponse.of(token, user));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        String idToken = body != null ? body.get("idToken") : null;
        if (idToken == null || idToken.isBlank()) {
            return ResponseEntity.status(401).body(Map.of("message", "Missing idToken"));
        }

        if (googleClientId == null || googleClientId.isBlank() || "YOUR_GOOGLE_CLIENT_ID".equals(googleClientId)) {
            return ResponseEntity.status(500).body(Map.of("message", "Google OAuth not configured"));
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken))
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return ResponseEntity.status(401).body(Map.of("message", "Invalid Google token"));
            }

            JsonNode json = objectMapper.readTree(response.body());
            String aud = json.has("aud") ? json.get("aud").asText() : null;
            if (aud == null || !aud.equals(googleClientId)) {
                return ResponseEntity.status(401).body(Map.of("message", "Token audience mismatch"));
            }

            String email = json.has("email") ? json.get("email").asText().trim().toLowerCase() : null;
            String name = json.has("name") ? json.get("name").asText().trim() : null;
            if (name == null || name.isBlank()) {
                String given = json.has("given_name") ? json.get("given_name").asText() : "";
                String family = json.has("family_name") ? json.get("family_name").asText() : "";
                name = (given + " " + family).trim();
            }
            if (name.isBlank()) name = email != null ? email : "User";

            if (email == null || email.isBlank()) {
                return ResponseEntity.status(401).body(Map.of("message", "Google token missing email"));
            }

            Optional<User> existing = userRepository.findByEmail(email);
            User user;
            if (existing.isPresent()) {
                user = existing.get();
            } else {
                user = new User();
                user.setEmail(email);
                user.setFullName(name);
                user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                user.setAdmin(false);
                userRepository.save(user);
            }

            String token = jwtService.generateToken(user);
            return ResponseEntity.ok(LoginResponse.of(token, user));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Google sign-in failed"));
        }
    }

}
