package webtech.online.course.services.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import webtech.online.course.dtos.course.VideoProgressDTO;
import webtech.online.course.exceptions.BaseError;
import webtech.online.course.models.*;
import webtech.online.course.repositories.LessonProgressRepository;
import webtech.online.course.services.LessonProgressService;
import webtech.online.course.services.VideoService;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LessonProgressServiceImpl implements LessonProgressService {
    private final LessonProgressRepository lessonProgressRepository;
    private final VideoService videoService;
    public LessonProgress getLessonProgress(Long userId, Long LessonId) {
        return lessonProgressRepository.findByIdLessonIdAndIdUserId(userId, LessonId).orElseThrow(()->new BaseError(400, "NOT FOUND PROGRESSLESSON USERID= %d AND LESSIONID %d".formatted(userId, LessonId)));
    }

    @Override
    @Transactional
    public LessonProgress commit(User user, Course course, Lesson lesson, VideoProgressDTO videoProgressDTO) {
        float duration = lesson.getVideo().getDuration(); // kiểu float

        LessonProgress old = lessonProgressRepository
                .findByIdLessonIdAndIdUserId(videoProgressDTO.lessonId(), videoProgressDTO.userId())
                .orElseGet(() -> {
                    LessonProgress lessonProgress = LessonProgress.builder()
                            .course(course)
                            .lesson(lesson)
                            .user(user)
                            .lastWatchedAtSecond(videoProgressDTO.currentSecond())
                            .firstWatchedAt(LocalDateTime.now())
                            .progressVideo(videoProgressDTO.currentSecond() / duration)
                            .build();
                    return lessonProgressRepository.save(lessonProgress);
                });

        if(old.getLastWatchedAtSecond() < videoProgressDTO.currentSecond()) {
            old.setLastWatchedAtSecond(videoProgressDTO.currentSecond());
            old.setProgressVideo(videoProgressDTO.currentSecond() / duration);
        }

        return lessonProgressRepository.save(old);
    }
}
