package com.ampli5.backend.pagecontent;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PageContentRepository extends JpaRepository<PageContent, UUID> {
    Optional<PageContent> findByPageKey(String pageKey);
}
