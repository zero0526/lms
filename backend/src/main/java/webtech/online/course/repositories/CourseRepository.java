package webtech.online.course.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import webtech.online.course.models.Course;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

}
