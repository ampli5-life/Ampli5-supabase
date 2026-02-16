package com.ampli5.backend.event;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    private final EventRepository repository;

    public EventController(EventRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Event> all() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Event get(@PathVariable UUID id) {
        return repository.findById(id).orElseThrow();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Event create(@RequestBody Event event) {
        event.setId(null);
        return repository.save(event);
    }

    @PutMapping("/{id}")
    public Event update(@PathVariable UUID id, @RequestBody Event updated) {
        Event existing = repository.findById(id).orElseThrow();
        existing.setTitle(updated.getTitle());
        existing.setDate(updated.getDate());
        existing.setDescription(updated.getDescription());
        existing.setInstructor(updated.getInstructor());
        existing.setSortOrder(updated.getSortOrder());
        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        repository.deleteById(id);
    }
}
