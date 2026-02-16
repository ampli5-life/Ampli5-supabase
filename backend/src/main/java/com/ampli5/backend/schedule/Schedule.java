package com.ampli5.backend.schedule;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "schedules")
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "day_of_week", nullable = false)
    private String dayOfWeek;

    @Column(nullable = false)
    private String time;

    @Column(name = "class_name", nullable = false)
    private String className;

    @Column(nullable = false)
    private String instructor;

    @Column(nullable = false)
    private String level;

    @Column(name = "sort_order")
    private Integer sortOrder;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public String getInstructor() { return instructor; }
    public void setInstructor(String instructor) { this.instructor = instructor; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
