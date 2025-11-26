package webtech.online.course.services.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import webtech.online.course.domains.FileInfo;
import webtech.online.course.dtos.Drive.DriveRequest;
import webtech.online.course.exceptions.BaseError;
import webtech.online.course.models.Chapter;
import webtech.online.course.models.Course;
import webtech.online.course.models.User;
import webtech.online.course.repositories.CourseRepository;
import webtech.online.course.services.CourseService;
import webtech.online.course.services.DriveService;
import webtech.online.course.services.UserService;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {
    public final CourseRepository courseRepository;
    public final UserService userService;
    private final DriveService driveService;

    @Override
    @Transactional
    public Course save(Course course, Long instructorId, MultipartFile thumbnail) throws IOException {
        String urlUploaded = "";
        if (!thumbnail.isEmpty()) {
            FileInfo fileInfo = driveService.uploadFile(new DriveRequest(thumbnail));
            urlUploaded = fileInfo.urlUploaded();
        }
        course.setThumbnailUrl(urlUploaded);
        User instructor = userService.findById(instructorId);
        course.setInstructor(instructor);
        return courseRepository.saveAndFlush(course);
    }

    @Override
    public Course findById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new BaseError(404, "not found cource has id= %d".formatted(id)));
    }

    @Override
    @Transactional
    public Course addNewChapter(Long courseId, Chapter chapter) {
        Course course = findById(courseId);
        course.addChapter(chapter);
        return courseRepository.saveAndFlush(course);
    }

    @Override
    @Transactional
    public Course update(Long id, webtech.online.course.dtos.course.CourseDTO courseDTO) throws IOException {
        Course course = findById(id);
        course.setTitle(courseDTO.title());
        course.setDescription(courseDTO.desc());
        if (courseDTO.thumbnail() != null && !courseDTO.thumbnail().isEmpty()) {
            FileInfo fileInfo = driveService.uploadFile(new DriveRequest(courseDTO.thumbnail()));
            course.setThumbnailUrl(fileInfo.urlUploaded());
        }
        if (courseDTO.instructorId() != null) {
            User instructor = userService.findById(courseDTO.instructorId());
            course.setInstructor(instructor);
        }
        return courseRepository.saveAndFlush(course);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Course course = findById(id);
        courseRepository.delete(course);
    }

    @Override
    public java.util.List<Course> findAll() {
        return courseRepository.findAll();
    }
}
