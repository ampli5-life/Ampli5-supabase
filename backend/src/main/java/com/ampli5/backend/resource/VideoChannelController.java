package com.ampli5.backend.resource;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/video-channels")
@CrossOrigin(origins = "*")
public class VideoChannelController {

    private final VideoChannelRepository repository;

    public VideoChannelController(VideoChannelRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<VideoChannel> all() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public VideoChannel get(@PathVariable UUID id) {
        return repository.findById(id).orElseThrow();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VideoChannel create(@RequestBody VideoChannel channel) {
        channel.setId(null);
        return repository.save(channel);
    }

    @PutMapping("/{id}")
    public VideoChannel update(@PathVariable UUID id, @RequestBody VideoChannel updated) {
        VideoChannel existing = repository.findById(id).orElseThrow();
        existing.setTitle(updated.getTitle());
        existing.setUrl(updated.getUrl());
        existing.setDescription(updated.getDescription());
        existing.setSortOrder(updated.getSortOrder());
        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        repository.deleteById(id);
    }
}
