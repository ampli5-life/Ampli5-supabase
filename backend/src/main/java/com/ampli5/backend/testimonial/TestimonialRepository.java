package com.ampli5.backend.testimonial;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TestimonialRepository extends JpaRepository<Testimonial, UUID> {
}
