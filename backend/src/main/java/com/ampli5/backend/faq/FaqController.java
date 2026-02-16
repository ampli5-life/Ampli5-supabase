package com.ampli5.backend.faq;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/faqs")
@CrossOrigin(origins = "*")
public class FaqController {

    private final FaqRepository repository;

    public FaqController(FaqRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Faq> all() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Faq get(@PathVariable UUID id) {
        return repository.findById(id).orElseThrow();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Faq create(@RequestBody Faq faq) {
        faq.setId(null);
        return repository.save(faq);
    }

    @PutMapping("/{id}")
    public Faq update(@PathVariable UUID id, @RequestBody Faq updated) {
        Faq existing = repository.findById(id).orElseThrow();
        existing.setQuestion(updated.getQuestion());
        existing.setAnswer(updated.getAnswer());
        existing.setSortOrder(updated.getSortOrder());
        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        repository.deleteById(id);
    }
}
