package com.ampli5.backend.auth;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<LoginResponse.UserDto> list() {
        return userRepository.findAll().stream()
                .map(u -> new LoginResponse.UserDto(u.getId(), u.getEmail(), u.getFullName(), u.isAdmin()))
                .toList();
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateUserRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "An account with this email already exists"));
        }
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setAdmin(request.isAdmin());
        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(new LoginResponse.UserDto(user.getId(), user.getEmail(), user.getFullName(), user.isAdmin()));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateAdmin(@PathVariable UUID id, @RequestBody Map<String, Boolean> body) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        Boolean admin = body.get("admin");
        if (admin != null) {
            // Multi-admin behavior: only update the selected user, never demote other admins implicitly.
            if (user.isAdmin() && !admin && userRepository.countByAdminTrue() <= 1) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "At least one admin must remain."));
            }
            user.setAdmin(admin);
            userRepository.save(user);
        }
        return ResponseEntity.ok(new LoginResponse.UserDto(user.getId(), user.getEmail(), user.getFullName(), user.isAdmin()));
    }
}
