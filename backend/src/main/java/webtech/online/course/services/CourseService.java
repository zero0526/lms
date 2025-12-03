package webtech.online.course.services;

import org.springframework.web.multipart.MultipartFile;
import webtech.online.course.dtos.course.*;
import webtech.online.course.models.Chapter;
import webtech.online.course.models.Course;
import webtech.online.course.models.User;

import java.io.IOException;
import java.util.List;

public interface CourseService {
    public Course save(Course course, Long instructorId, MultipartFile thumbnail, List<String> tags) throws IOException;

    public Course findById(Long id);

    public Course addNewChapter(Long courseId, Chapter chapter);

    public Course update(Long id, webtech.online.course.dtos.course.CourseDTO courseDTO) throws IOException;

    public void delete(Long id);
//    public CourseDetailsDTO details(Long courseId);
    public List<RecommendedCourseDTO> recommendCourse(Long userId, Integer limit);
    public List<MyCourseDTO> getMyCourse(Long userId);
    public List<String> getAllTitlesFromDB();
    public List<SearchedCourseRes> findSearchedCourse(CourseSearchReq courseSearchReq);
    public List<DetailsCourseDTO> getDetailsCourse(Long courseId);
}
