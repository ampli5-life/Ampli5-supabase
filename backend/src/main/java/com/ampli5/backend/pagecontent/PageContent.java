package com.ampli5.backend.pagecontent;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "page_content", uniqueConstraints = @UniqueConstraint(columnNames = "page_key"))
public class PageContent {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "page_key", nullable = false, unique = true)
    private String pageKey;

    @Column(name = "content_json", columnDefinition = "text")
    private String contentJson;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getPageKey() { return pageKey; }
    public void setPageKey(String pageKey) { this.pageKey = pageKey; }
    public String getContentJson() { return contentJson; }
    public void setContentJson(String contentJson) { this.contentJson = contentJson; }
}
