package com.ampli5.backend.team;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/team")
@CrossOrigin(origins = "*")
public class TeamMemberController {

    private final TeamMemberRepository repository;

    public TeamMemberController(TeamMemberRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<TeamMember> all() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public TeamMember get(@PathVariable UUID id) {
        return repository.findById(id).orElseThrow();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TeamMember create(@RequestBody TeamMember member) {
        member.setId(null);
        return repository.save(member);
    }

    @PutMapping("/{id}")
    public TeamMember update(@PathVariable UUID id, @RequestBody TeamMember updated) {
        TeamMember existing = repository.findById(id).orElseThrow();
        existing.setName(updated.getName());
        existing.setRole(updated.getRole());
        existing.setBio(updated.getBio());
        existing.setAvatarUrl(updated.getAvatarUrl());
        existing.setSortOrder(updated.getSortOrder());
        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        repository.deleteById(id);
    }
}
