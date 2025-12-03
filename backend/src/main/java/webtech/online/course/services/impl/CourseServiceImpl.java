package webtech.online.course.services.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import webtech.online.course.domains.FileInfo;
import webtech.online.course.dtos.Drive.DriveRequest;
import webtech.online.course.dtos.course.*;
import webtech.online.course.exceptions.BaseError;
import webtech.online.course.models.*;
import webtech.online.course.repositories.CourseRepository;
import webtech.online.course.services.*;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {
    public final CourseRepository courseRepository;
    public final UserService userService;
    private final DriveService driveService;
    private final RecommendationService recommendationService;
    private final TagService tagService;
    private final CourseSearchEngineService courseSearchEngineService;

    @Override
    @Transactional
    public Course save(Course course, Long instructorId, MultipartFile thumbnail, List<String> tags) throws IOException {
        String urlUploaded = "";
        if (!thumbnail.isEmpty()) {
            FileInfo fileInfo = driveService.uploadFile(new DriveRequest(thumbnail));
            urlUploaded = fileInfo.urlUploaded();
        }
        course.setThumbnailUrl(urlUploaded);
        User instructor = userService.findById(instructorId);
        course.setInstructor(instructor);
        List<Tag> newTags= tagService.findOrCreateTags(tags);
        newTags.forEach(course::addTag);
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
    public Course update(Long id, CourseDTO courseDTO) throws IOException {
        Course course = findById(id);

        if (courseDTO.title() != null) {
            course.setTitle(courseDTO.title());
        }

        if (courseDTO.desc() != null) {
            course.setDescription(courseDTO.desc());
        }

        if (courseDTO.courseTarget() != null && !courseDTO.courseTarget().isEmpty()) {
            course.setCourseTarget(String.join("||", courseDTO.courseTarget()));
        }

        if (courseDTO.precondition() != null && !courseDTO.precondition().isEmpty()) {
            course.setPrecondition(String.join("||", courseDTO.precondition()));
        }

        if (courseDTO.thumbnail() != null && !courseDTO.thumbnail().isEmpty()) {
            FileInfo fileInfo = driveService.uploadFile(new DriveRequest(courseDTO.thumbnail()));
            course.setThumbnailUrl(fileInfo.urlUploaded());
        }

        if (courseDTO.instructorId() != null) {
            User instructor = userService.findById(courseDTO.instructorId());
            course.setInstructor(instructor);
        }

        if (courseDTO.tags() != null && !courseDTO.tags().isEmpty()) {
            List<Tag> tagsEntities = tagService.findOrCreateTags(courseDTO.tags());

            course.getTags().removeIf(tag -> !tagsEntities.contains(tag));

            for (Tag tag : tagsEntities) {
                if (!course.getTags().contains(tag)) {
                    course.addTag(tag);
                }
            }
        }

        return courseRepository.saveAndFlush(course);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Course course = findById(id);
        courseRepository.delete(course);
    }

    @Transactional
    public RecommendedCourseDTO parseId2Recommend(RecommendationResponse recom){
        return courseRepository.findRecommendCourse(recom.courseId());
    }

    public List<RecommendedCourseDTO> recommendCourse(Long userId, Integer limit){
        List<RecommendationResponse> rrs = recommendationService.recommend(userId, limit);
        return rrs.stream().map(this::parseId2Recommend).toList();
    }

    @Override
    public List<MyCourseDTO> getMyCourse(Long userId) {
        return courseRepository.findMyCourse(userId);
    }

    @Override
    public List<String> getAllTitlesFromDB() {
        return courseRepository.getAllCourseTitles();
    }

    @Override
    public List<SearchedCourseRes> findSearchedCourse(CourseSearchReq courseSearchReq) {
        List<Long> ids= courseSearchEngineService.searchCourses(courseSearchReq);
        return courseRepository.findSearchCourseByIds(ids);
    }

    @Override
    public List<DetailsCourseDTO> getDetailsCourse(Long courseId) {
        return List.of();
    }
}
