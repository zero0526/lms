package webtech.online.course.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import webtech.online.course.models.LessonProgress;
import webtech.online.course.models.LessonProgressId;

import java.util.Optional;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, LessonProgressId> {
    Optional<LessonProgress> findByIdLessonIdAndIdUserId(Long lessonId, Long userId);
}