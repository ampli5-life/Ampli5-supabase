package com.ampli5.backend.video;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;
import java.util.UUID;

/** Video response for non-admin users; excludes youtube_url to prevent link sharing. */
public record VideoPublicResponse(
    UUID id,
    String title,
    String description,
    @JsonProperty("thumbnail_url") String thumbnailUrl,
    @JsonProperty("is_paid") boolean paid,
    String category,
    Integer duration,
    String instructor,
    @JsonProperty("created_at") OffsetDateTime createdAt,
    @JsonProperty("updated_at") OffsetDateTime updatedAt
) {
    public static VideoPublicResponse from(Video v) {
        return new VideoPublicResponse(
            v.getId(),
            v.getTitle(),
            v.getDescription(),
            v.getThumbnailUrl(),
            v.isPaid(),
            v.getCategory(),
            v.getDuration(),
            v.getInstructor(),
            v.getCreatedAt(),
            v.getUpdatedAt()
        );
    }
}
