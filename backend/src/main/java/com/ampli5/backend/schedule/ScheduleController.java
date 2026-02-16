package com.ampli5.backend.schedule;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin(origins = "*")
public class ScheduleController {

    private final ScheduleRepository repository;

    public ScheduleController(ScheduleRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Schedule> all() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Schedule get(@PathVariable UUID id) {
        return repository.findById(id).orElseThrow();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Schedule create(@RequestBody Schedule schedule) {
        schedule.setId(null);
        return repository.save(schedule);
    }

    @PutMapping("/{id}")
    public Schedule update(@PathVariable UUID id, @RequestBody Schedule updated) {
        Schedule existing = repository.findById(id).orElseThrow();
        existing.setDayOfWeek(updated.getDayOfWeek());
        existing.setTime(updated.getTime());
        existing.setClassName(updated.getClassName());
        existing.setInstructor(updated.getInstructor());
        existing.setLevel(updated.getLevel());
        existing.setSortOrder(updated.getSortOrder());
        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        repository.deleteById(id);
    }
}
