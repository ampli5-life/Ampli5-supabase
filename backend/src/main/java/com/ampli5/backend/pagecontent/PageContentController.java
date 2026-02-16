package com.ampli5.backend.pagecontent;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/page-content")
@CrossOrigin(origins = "*")
public class PageContentController {

    private final PageContentRepository repository;

    public PageContentController(PageContentRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<PageContent> all() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public PageContent get(@PathVariable UUID id) {
        return repository.findById(id).orElseThrow();
    }

    @GetMapping("/key/{key}")
    public ResponseEntity<PageContent> getByKey(@PathVariable String key) {
        return repository.findByPageKey(key)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PageContent create(@RequestBody PageContent content) {
        content.setId(null);
        return repository.save(content);
    }

    @PutMapping("/{id}")
    public PageContent update(@PathVariable UUID id, @RequestBody PageContent updated) {
        PageContent existing = repository.findById(id).orElseThrow();
        existing.setPageKey(updated.getPageKey());
        existing.setContentJson(updated.getContentJson());
        return repository.save(existing);
    }

    @PutMapping("/key/{key}")
    public PageContent upsertByKey(@PathVariable String key, @RequestBody PageContent updated) {
        var existing = repository.findByPageKey(key);
        PageContent content;
        if (existing.isPresent()) {
            content = existing.get();
            content.setContentJson(updated.getContentJson());
        } else {
            content = new PageContent();
            content.setPageKey(key);
            content.setContentJson(updated.getContentJson());
        }
        return repository.save(content);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        repository.deleteById(id);
    }
}
