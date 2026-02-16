package com.ampli5.backend.resource;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface VideoChannelRepository extends JpaRepository<VideoChannel, UUID> {
}
