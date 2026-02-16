package com.ampli5.backend.resource;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recommended-readings")
@CrossOrigin(origins = "*")
public class RecommendedReadingController {

    private final RecommendedReadingRepository repository;

    public RecommendedReadingController(RecommendedReadingRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<RecommendedReading> all() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public RecommendedReading get(@PathVariable UUID id) {
        return repository.findById(id).orElseThrow();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecommendedReading create(@RequestBody RecommendedReading reading) {
        reading.setId(null);
        return repository.save(reading);
    }

    @PutMapping("/{id}")
    public RecommendedReading update(@PathVariable UUID id, @RequestBody RecommendedReading updated) {
        RecommendedReading existing = repository.findById(id).orElseThrow();
        existing.setTitle(updated.getTitle());
        existing.setSortOrder(updated.getSortOrder());
        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        repository.deleteById(id);
    }
}
