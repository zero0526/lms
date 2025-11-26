package webtech.online.course.services;

import webtech.online.course.dtos.course.LessonDTO;
import webtech.online.course.models.Lesson;

import java.io.IOException;

public interface LessonService {
    public Lesson insert(LessonDTO lessonDTO) throws IOException;

    public Lesson update(Long id, LessonDTO lessonDTO) throws IOException;

    public void delete(Long id);

    public java.util.List<Lesson> findAll();

    public Lesson findById(Long id);

    public void addQuiz(Long lessonId, webtech.online.course.dtos.course.QuizDTO quizDTO);

    public void addCourseMaterial(Long lessonId, webtech.online.course.dtos.course.CourseMaterialDTO courseMaterialDTO);
}
