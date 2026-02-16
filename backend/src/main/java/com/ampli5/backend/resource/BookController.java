package com.ampli5.backend.resource;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    private final BookRepository repository;

    public BookController(BookRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Book> all() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Book get(@PathVariable UUID id) {
        return repository.findById(id).orElseThrow();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Book create(@RequestBody Book book) {
        book.setId(null);
        return repository.save(book);
    }

    @PutMapping("/{id}")
    public Book update(@PathVariable UUID id, @RequestBody Book updated) {
        Book existing = repository.findById(id).orElseThrow();
        existing.setTitle(updated.getTitle());
        existing.setAuthor(updated.getAuthor());
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
