package com.ampli5.backend.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;

public class LoginResponse {

    private String token;
    private UserDto user;

    public LoginResponse() {
    }

    public LoginResponse(String token, UserDto user) {
        this.token = token;
        this.user = user;
    }

    public static LoginResponse of(String token, User user) {
        UserDto dto = new UserDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.isAdmin()
        );
        return new LoginResponse(token, dto);
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }

    public static class UserDto {
        private UUID id;
        private String email;
        private String fullName;
        @JsonProperty("isAdmin")
        private boolean admin;

        public UserDto() {
        }

        public UserDto(UUID id, String email, String fullName, boolean admin) {
            this.id = id;
            this.email = email;
            this.fullName = fullName;
            this.admin = admin;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public boolean isAdmin() { return admin; }
        public void setAdmin(boolean admin) { this.admin = admin; }
    }
}
