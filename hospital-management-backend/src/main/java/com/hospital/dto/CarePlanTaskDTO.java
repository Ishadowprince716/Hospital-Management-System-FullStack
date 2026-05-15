package com.hospital.dto;

public class CarePlanTaskDTO {
    private Long id;
    private String title;
    private String category;
    private String time;
    private boolean done;

    public CarePlanTaskDTO() {
    }

    public CarePlanTaskDTO(Long id, String title, String category, String time, boolean done) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.time = time;
        this.done = done;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public boolean isDone() {
        return done;
    }

    public void setDone(boolean done) {
        this.done = done;
    }
}
