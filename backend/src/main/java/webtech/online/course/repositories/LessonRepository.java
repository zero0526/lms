package webtech.online.course.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import webtech.online.course.models.Lesson;
@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
}
