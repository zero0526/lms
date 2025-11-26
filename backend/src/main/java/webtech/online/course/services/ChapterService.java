package webtech.online.course.services;

import webtech.online.course.models.Chapter;
import webtech.online.course.models.Lesson;

public interface ChapterService {
    public void addLesson(Long chapterId, Lesson lesson);

    public Chapter findById(Long chapterId);

    public Chapter save(webtech.online.course.dtos.course.ChapterDTO chapterDTO);

    public Chapter update(Long id, webtech.online.course.dtos.course.ChapterDTO chapterDTO);

    public void delete(Long id);

    public java.util.List<Chapter> findAll();
}
