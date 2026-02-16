package com.ampli5.backend.faq;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FaqRepository extends JpaRepository<Faq, UUID> {
}
