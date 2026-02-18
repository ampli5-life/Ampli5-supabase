package com.ampli5.backend.video;

import com.ampli5.backend.subscription.SubscriptionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/videos")
@CrossOrigin(origins = "*")
public class VideoController {

    private static final Pattern YOUTUBE_VIDEO_ID = Pattern.compile("(?:youtube\\.com/watch\\?v=|youtu\\.be/|youtube\\.com/embed/)([a-zA-Z0-9_-]{11})");

    private final VideoRepository repository;
    private final SubscriptionService subscriptionService;

    public VideoController(VideoRepository repository, SubscriptionService subscriptionService) {
        this.repository = repository;
        this.subscriptionService = subscriptionService;
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }

    private String extractYoutubeVideoId(String url) {
        if (url == null || url.isBlank()) return null;
        Matcher m = YOUTUBE_VIDEO_ID.matcher(url.trim());
        return m.find() ? m.group(1) : null;
    }

    private void ensureThumbnail(Video video) {
        if (video.getThumbnailUrl() == null || video.getThumbnailUrl().isBlank()) {
            String vid = extractYoutubeVideoId(video.getYoutubeUrl());
            if (vid != null) {
                video.setThumbnailUrl("https://img.youtube.com/vi/" + vid + "/mqdefault.jpg");
            }
        }
    }

    @GetMapping
    public Object all() {
        List<Video> videos = repository.findAll();
        if (isAdmin()) {
            return videos;
        }
        return videos.stream().map(VideoPublicResponse::from).toList();
    }

    @GetMapping("/{id}")
    public Object get(@PathVariable UUID id) {
        Video video = repository.findById(id).orElseThrow();
        if (isAdmin()) {
            return video;
        }
        return VideoPublicResponse.from(video);
    }

    @GetMapping("/{id}/embed")
    public ResponseEntity<?> embed(@PathVariable UUID id, Principal principal) {
        Video video = repository.findById(id).orElseThrow();
        if (!video.isPaid()) {
            String vid = extractYoutubeVideoId(video.getYoutubeUrl());
            if (vid == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid YouTube URL"));
            }
            return ResponseEntity.ok(Map.of("embedUrl", "https://www.youtube.com/embed/" + vid));
        }
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Authentication required for paid content"));
        }
        try {
            UUID userId = UUID.fromString(principal.getName());
            if (!subscriptionService.hasActiveSubscription(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Active subscription required"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Invalid authentication"));
        }
        String vid = extractYoutubeVideoId(video.getYoutubeUrl());
        if (vid == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid YouTube URL"));
        }
        return ResponseEntity.ok(Map.of("embedUrl", "https://www.youtube.com/embed/" + vid));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Video video) {
        if (video.getTitle() == null || video.getTitle().isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Title is required"));
        }
        if (video.getYoutubeUrl() == null || video.getYoutubeUrl().isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "YouTube URL is required"));
        }
        video.setId(null);
        video.setCreatedAt(OffsetDateTime.now());
        video.setUpdatedAt(OffsetDateTime.now());
        ensureThumbnail(video);
        if (video.getThumbnailUrl() == null || video.getThumbnailUrl().isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Could not extract thumbnail from YouTube URL. Please provide a valid URL (e.g. https://www.youtube.com/watch?v=VIDEO_ID) or add thumbnail URL manually."));
        }
        if (video.getDescription() == null) video.setDescription("");
        if (video.getCategory() == null) video.setCategory("");
        if (video.getDuration() == null) video.setDuration(0);
        if (video.getInstructor() == null) video.setInstructor("");
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(video));
    }

    @PutMapping("/{id}")
    public Video update(@PathVariable UUID id, @RequestBody Video updated) {
        Video existing = repository.findById(id).orElseThrow();
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setYoutubeUrl(updated.getYoutubeUrl());
        existing.setThumbnailUrl(updated.getThumbnailUrl());
        existing.setPaid(updated.isPaid());
        existing.setCategory(updated.getCategory());
        existing.setDuration(updated.getDuration());
        existing.setInstructor(updated.getInstructor());
        existing.setUpdatedAt(OffsetDateTime.now());
        ensureThumbnail(existing);
        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        repository.deleteById(id);
    }
}

