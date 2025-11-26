package webtech.online.course.services;

import org.springframework.web.multipart.MultipartFile;
import webtech.online.course.models.Chapter;
import webtech.online.course.models.Course;
import webtech.online.course.models.User;

import java.io.IOException;

public interface CourseService {
    public Course save(Course course, Long instructorId, MultipartFile thumbnail) throws IOException;

    public Course findById(Long id);

    public Course addNewChapter(Long courseId, Chapter chapter);

    public Course update(Long id, webtech.online.course.dtos.course.CourseDTO courseDTO) throws IOException;

    public void delete(Long id);

    public java.util.List<Course> findAll();
}
