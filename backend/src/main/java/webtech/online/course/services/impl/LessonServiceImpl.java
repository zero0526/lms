package webtech.online.course.services.impl;

import jakarta.transaction.Transactional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import webtech.online.course.dtos.course.CourseMaterialDTO;
import webtech.online.course.dtos.course.LessonDTO;
import webtech.online.course.dtos.course.QuizDTO;
import webtech.online.course.models.*;
import webtech.online.course.repositories.LessonRepository;
import webtech.online.course.services.*;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {
    private final LessonRepository lessonRepository;
    private final QuizService quizService;
    private final VideoService videoService;
    private final CourseMaterialService courseMaterialService;

    @Override
    public Lesson insert(LessonDTO lessonDTO) throws IOException {
        Lesson lesson = Lesson.builder()
                .title(lessonDTO.title())
                .order(lessonDTO.order())
                .precondition(lessonDTO.preCond())
                .description(lessonDTO.desc())
                .build();

        if (lessonDTO.courseMaterialDTOs() != null && !lessonDTO.courseMaterialDTOs().isEmpty()) {
            lessonDTO.courseMaterialDTOs().forEach(cmDTO -> {
                CourseMaterial cm = courseMaterialService.parser(cmDTO);
                lesson.addCourseMaterials(cm);
            });
        }
        if (lessonDTO.videoDTO() != null) {
            Video video = videoService.uploadVideo(lessonDTO.videoDTO());
            lesson.setVideo(video);
        }
        if (lessonDTO.quizDTOs() != null && !lessonDTO.quizDTOs().isEmpty()) {
            lessonDTO.quizDTOs().forEach(qz -> {
                Quiz quiz = quizService.uploadQuiz(qz);
                lesson.addQuiz(quiz);
            });
        }
        // lessonRepository.saveAndFlush(lesson);
        return lesson;
    }

    @Override
    @Transactional
    public Lesson update(Long id, LessonDTO lessonDTO) throws IOException {
        Lesson lesson = findById(id);
        lesson.setTitle(lessonDTO.title());
        lesson.setOrder(lessonDTO.order());
        lesson.setPrecondition(lessonDTO.preCond());
        lesson.setDescription(lessonDTO.desc());

        if (lessonDTO.videoDTO() != null) {
            Video video = videoService.uploadVideo(lessonDTO.videoDTO());
            lesson.setVideo(video);
        }
        // Note: Updating quizzes and materials is more complex and might require
        // specific logic
        // For now, we update basic info and video if provided.

        return lessonRepository.saveAndFlush(lesson);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Lesson lesson = findById(id);
        lessonRepository.delete(lesson);
    }

    @Override
    public java.util.List<Lesson> findAll() {
        return lessonRepository.findAll();
    }

    @Override
    public Lesson findById(Long id) {
        return lessonRepository.findById(id).orElseThrow(
                () -> new webtech.online.course.exceptions.BaseError(404, "Lesson not found with id=" + id));
    }

    @Override
    @Transactional
    public void addQuiz(Long lessonId, QuizDTO quizDTO) {
        Lesson lesson = findById(lessonId);
        Quiz quiz = quizService.uploadQuiz(quizDTO);
        lesson.addQuiz(quiz);
        lessonRepository.saveAndFlush(lesson);
    }

    @Override
    @Transactional
    public void addCourseMaterial(Long lessonId, CourseMaterialDTO courseMaterialDTO) {
        Lesson lesson = findById(lessonId);
        CourseMaterial cm = courseMaterialService.parser(courseMaterialDTO);
        lesson.addCourseMaterials(cm);
        lessonRepository.saveAndFlush(lesson);
    }
}
