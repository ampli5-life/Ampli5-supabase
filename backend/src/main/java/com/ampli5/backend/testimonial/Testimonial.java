package com.ampli5.backend.testimonial;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "testimonials")
public class Testimonial {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, columnDefinition = "text")
    private String text;

    @Column(nullable = false)
    private String author;

    @Column(name = "sort_order")
    private Integer sortOrder;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
