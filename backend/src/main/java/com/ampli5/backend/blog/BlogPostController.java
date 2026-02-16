package com.ampli5.backend.blog;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/blog")
@CrossOrigin(origins = "*")
public class BlogPostController {

    private final BlogPostRepository repository;

    public BlogPostController(BlogPostRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<BlogPost> all() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public BlogPost get(@PathVariable UUID id) {
        return repository.findById(id).orElseThrow();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BlogPost create(@RequestBody BlogPost post) {
        post.setId(null);
        return repository.save(post);
    }

    @PutMapping("/{id}")
    public BlogPost update(@PathVariable UUID id, @RequestBody BlogPost updated) {
        BlogPost existing = repository.findById(id).orElseThrow();
        existing.setTitle(updated.getTitle());
        existing.setExcerpt(updated.getExcerpt());
        existing.setTag(updated.getTag());
        existing.setPublishedAt(updated.getPublishedAt());
        existing.setSortOrder(updated.getSortOrder());
        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        repository.deleteById(id);
    }
}
