package com.ampli5.backend.video;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/videos")
@CrossOrigin(origins = "*")
public class VideoController {

    private static final Pattern YOUTUBE_VIDEO_ID = Pattern.compile("(?:youtube\\.com/watch\\?v=|youtu\\.be/|youtube\\.com/embed/)([a-zA-Z0-9_-]{11})");

    private final VideoRepository repository;

    public VideoController(VideoRepository repository) {
        this.repository = repository;
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
    public List<Video> all() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Video get(@PathVariable UUID id) {
        return repository.findById(id).orElseThrow();
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

