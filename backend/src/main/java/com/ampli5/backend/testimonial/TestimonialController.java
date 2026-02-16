package com.ampli5.backend.testimonial;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/testimonials")
@CrossOrigin(origins = "*")
public class TestimonialController {

    private final TestimonialRepository repository;

    public TestimonialController(TestimonialRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Testimonial> all() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Testimonial get(@PathVariable UUID id) {
        return repository.findById(id).orElseThrow();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Testimonial create(@RequestBody Testimonial testimonial) {
        testimonial.setId(null);
        return repository.save(testimonial);
    }

    @PutMapping("/{id}")
    public Testimonial update(@PathVariable UUID id, @RequestBody Testimonial updated) {
        Testimonial existing = repository.findById(id).orElseThrow();
        existing.setText(updated.getText());
        existing.setAuthor(updated.getAuthor());
        existing.setSortOrder(updated.getSortOrder());
        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        repository.deleteById(id);
    }
}
