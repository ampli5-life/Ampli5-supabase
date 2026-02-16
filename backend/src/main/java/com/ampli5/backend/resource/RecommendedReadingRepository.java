package com.ampli5.backend.resource;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RecommendedReadingRepository extends JpaRepository<RecommendedReading, UUID> {
}
