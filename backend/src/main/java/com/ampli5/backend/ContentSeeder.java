package com.ampli5.backend;

import com.ampli5.backend.auth.User;
import com.ampli5.backend.auth.UserRepository;
import com.ampli5.backend.video.Video;
import com.ampli5.backend.video.VideoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;

@Component
public class ContentSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VideoRepository videoRepository;
    private final PasswordEncoder passwordEncoder;

    public ContentSeeder(UserRepository userRepository, VideoRepository videoRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.videoRepository = videoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedAdmin();
        seedVideos();
    }

    private void seedAdmin() {
        if (userRepository.findByEmail("admin@ampli5.app").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@ampli5.app");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("Admin User");
            admin.setAdmin(true);
            userRepository.save(admin);
        }
    }

    private void seedVideos() {
        if (videoRepository.count() > 0) return;

        OffsetDateTime now = OffsetDateTime.now();
        List<Video> samples = List.of(
                video("Morning Stretch", "A gentle 10-minute stretch to start your day.", "https://www.youtube.com/watch?v=4Bkaa1lEhnk", "Beginner", 10, "Ampli5", false, now),
                video("Breathing Basics", "Learn foundational breathing for meditation.", "https://www.youtube.com/watch?v=4Bkaa1lEhnk", "Beginner", 5, "Ampli5", false, now),
                video("The Journey", "An immersive flow for mind and body.", "https://www.youtube.com/watch?v=rEuGIWFfj2E", "Beginner", 15, "Ampli5", true, now),
                video("Advanced Flow", "Full premium yoga flow for subscribers.", "https://www.youtube.com/watch?v=4Bkaa1lEhnk", "Intermediate", 25, "Ampli5", true, now),
                video("Evening Wind-Down", "Calming sequence to end your day.", "https://www.youtube.com/watch?v=rEuGIWFfj2E", "Beginner", 12, "Ampli5", true, now)
        );
        videoRepository.saveAll(samples);
    }

    private static Video video(String title, String description, String youtubeUrl, String category, int duration, String instructor, boolean paid, OffsetDateTime now) {
        Video v = new Video();
        v.setTitle(title);
        v.setDescription(description);
        v.setYoutubeUrl(youtubeUrl);
        v.setThumbnailUrl(thumbnailFromYoutubeUrl(youtubeUrl));
        v.setCategory(category);
        v.setDuration(duration);
        v.setInstructor(instructor);
        v.setPaid(paid);
        v.setCreatedAt(now);
        v.setUpdatedAt(now);
        return v;
    }

    private static String thumbnailFromYoutubeUrl(String url) {
        if (url == null || url.isBlank()) return "";
        String id = null;
        if (url.contains("youtu.be/")) {
            int i = url.indexOf("youtu.be/") + 9;
            int end = url.indexOf('?', i) > 0 ? url.indexOf('?', i) : url.length();
            id = url.substring(i, end).trim();
        } else if (url.contains("v=")) {
            int i = url.indexOf("v=") + 2;
            int end = url.indexOf('&', i) > 0 ? url.indexOf('&', i) : url.length();
            id = url.substring(i, Math.min(i + 11, end)).trim();
        }
        return id != null && !id.isEmpty() ? "https://img.youtube.com/vi/" + id + "/mqdefault.jpg" : "";
    }
}
