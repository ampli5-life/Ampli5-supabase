package com.ampli5.backend.resource;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/apps")
@CrossOrigin(origins = "*")
public class AppController {

    private final AppRepository repository;

    public AppController(AppRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<App> all() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public App get(@PathVariable UUID id) {
        return repository.findById(id).orElseThrow();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public App create(@RequestBody App app) {
        app.setId(null);
        return repository.save(app);
    }

    @PutMapping("/{id}")
    public App update(@PathVariable UUID id, @RequestBody App updated) {
        App existing = repository.findById(id).orElseThrow();
        existing.setName(updated.getName());
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
