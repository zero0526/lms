package webtech.online.course.services.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import webtech.online.course.exceptions.BaseError;
import webtech.online.course.models.Chapter;
import webtech.online.course.models.Lesson;
import webtech.online.course.repositories.ChapterRepository;
import webtech.online.course.services.ChapterService;

@Service
@RequiredArgsConstructor
public class ChapterServiceImpl implements ChapterService {
    private final ChapterRepository chapterRepository;
    private final webtech.online.course.services.CourseService courseService;

    @Override
    @Transactional
    public void addLesson(Long chapterId, Lesson lesson) {
        Chapter chapter = findById(chapterId);
        chapter.addLesson(lesson);
        chapterRepository.saveAndFlush(chapter);
    }

    @Override
    public Chapter findById(Long chapterId) {
        return chapterRepository.findById(chapterId).orElseThrow(() -> new BaseError(404, "Not found exception"));
    }

    @Override
    @Transactional
    public Chapter save(webtech.online.course.dtos.course.ChapterDTO chapterDTO) {
        return courseService.addNewChapter(chapterDTO.courseId(), Chapter.builder()
                .title(chapterDTO.title())
                .order(chapterDTO.order())
                .build()).getChapters().getLast();
    }

    @Override
    @Transactional
    public Chapter update(Long id, webtech.online.course.dtos.course.ChapterDTO chapterDTO) {
        Chapter chapter = findById(id);
        chapter.setTitle(chapterDTO.title());
        chapter.setOrder(chapterDTO.order());
        return chapterRepository.saveAndFlush(chapter);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Chapter chapter = findById(id);
        chapterRepository.delete(chapter);
    }

    @Override
    public java.util.List<Chapter> findAll() {
        return chapterRepository.findAll();
    }
}
