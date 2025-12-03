package webtech.online.course.controllers;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import webtech.online.course.domains.CourseSearchDTO;
import webtech.online.course.dtos.course.*;
import webtech.online.course.exceptions.BaseError;
import webtech.online.course.exceptions.ErrorResponse;
import webtech.online.course.exceptions.WrapperResponse;
import webtech.online.course.models.*;
import webtech.online.course.services.*;
import webtech.online.course.services.impl.CourseSuggestService;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/course")
public class CourseController {
    private final CourseService courseService;
    private final LessonService lessonService;
    private final ChapterService chapterService;
    private final UserService userService;
    private final LessonProgressService lessonProgressService;
    private final CourseSearchEngineService courseSearchEngineService;

    @PostMapping(value = "/post")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<WrapperResponse> postCourse(@ModelAttribute CourseDTO courseDTO, HttpServletRequest request) {
        try {
            Course course = courseService.save(Course.builder()
                    .title(courseDTO.title())
                    .description(courseDTO.desc())
                            .courseTarget(String.join("||",courseDTO.courseTarget()))
                            .precondition(String.join("||",courseDTO.precondition()))
                    .build(), courseDTO.instructorId(), courseDTO.thumbnail(), courseDTO.tags().stream().map(String::toLowerCase).toList());
            return ResponseEntity.ok(new WrapperResponse(HttpStatus.CREATED.value(), "successfully"));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @PutMapping("/add-chapter")
    public ResponseEntity<WrapperResponse> addChapter(@RequestBody ChapterDTO chapterDTO, HttpServletRequest request) {
        try {
            courseService.addNewChapter(chapterDTO.courseId(), Chapter.builder()
                    .order(chapterDTO.order())
                    .title(chapterDTO.title())
                    .build());
            return ResponseEntity.ok(new WrapperResponse(HttpStatus.OK.value(), "successfully"));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @PutMapping("/add-lesson")
    public ResponseEntity<WrapperResponse> addLesson(@ModelAttribute LessonDTO lessonDTO, HttpServletRequest request) throws IOException {
         try{
            Lesson lesson = lessonService.insert(lessonDTO);
            chapterService.addLesson(lessonDTO.chapterId(), lesson);
            return ResponseEntity.ok(new WrapperResponse(HttpStatus.OK.value(), "successfully"));
         }catch (Exception ex){
            throw new BaseError(500, ex.getMessage());
         }
    }
    @GetMapping("/{userId}")
    public ResponseEntity<WrapperResponse> getMyCourse(@PathVariable Long userId){
        try{
            List<MyCourseDTO> myCourseDTOS = courseService.getMyCourse(userId);
            return ResponseEntity.ok(new WrapperResponse(HttpStatus.OK.value(), myCourseDTOS));
        }catch (Exception e){
            throw new BaseError(HttpStatus.BAD_REQUEST.value(), e.getMessage());
        }
    }
//    @GetMapping("/{userId}")
//    public ResponseEntity<WrapperResponse> getMyCourse(@PathVariable Long userId){
//        try{
//            return null
//        }catch (Exception e){
//            throw new BaseError(HttpStatus.BAD_REQUEST.value(), e.getMessage());
//        }
//    }
//    @GetMapping("/details/{id}")
//    public ResponseEntity<WrapperResponse> getCourseById(@PathVariable Long id) {
//        try{
//            courseService.details();
//        }catch (Exception e){
//
//        }
//        return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
//    }
//update them sau khi submit quizz
    @PostMapping("/update-progress")
    public ResponseEntity<WrapperResponse> updateProgress(@RequestBody VideoProgressDTO videoProgressDTO){
        try{
            User user=userService.findById(videoProgressDTO.userId());
            Course course= courseService.findById(videoProgressDTO.courseId());
            Lesson lesson= lessonService.findById(videoProgressDTO.lessonId());
            lessonProgressService.commit(user, course, lesson, videoProgressDTO);
            return ResponseEntity.ok(new WrapperResponse(HttpStatus.OK.value(), "successful"));
        }catch (Exception e){
            throw new BaseError(500, "failed");
        }
    }
    @GetMapping("/recommend/{userId}")
    public ResponseEntity<WrapperResponse> recommend(Long userId){
        try{
            List<RecommendedCourseDTO> recommendedCourseDTOs= courseService.recommendCourse(userId, 10);
            return ResponseEntity.ok(new WrapperResponse(HttpStatus.OK.value(), recommendedCourseDTOs));
        }catch (Exception e){
            throw new BaseError(500, e.getMessage());
        }
    }
    @GetMapping("/search")
    public ResponseEntity<WrapperResponse> search(
            @RequestBody CourseSearchReq courseSearchReq
    ) {
        try{
           List<SearchedCourseRes> searchedCourseRes= courseService.findSearchedCourse(courseSearchReq);
           return ResponseEntity.ok(new WrapperResponse(200, searchedCourseRes ));
        }catch (Exception e){
            throw new BaseError(e.getMessage());
        }
    }
    @GetMapping("/search/auto-complete")
    public ResponseEntity<WrapperResponse> autocomplete(@RequestParam String keyword, @RequestParam(defaultValue = "10") int limit){
        try{
            List<String> suggestions= courseSearchEngineService.autoCompleteCourseTitle(keyword, limit);
            return ResponseEntity.ok(new WrapperResponse(HttpStatus.OK.value(), suggestions));
        }catch (Exception ex){
            throw new BaseError(HttpStatus.BAD_REQUEST.value(), ex.getMessage());
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<WrapperResponse> updateCourse(@PathVariable Long id, @ModelAttribute CourseDTO courseDTO,
            HttpServletRequest request) {
        try {
            courseService.update(id, courseDTO);
            return ResponseEntity.ok(new WrapperResponse(HttpStatus.OK.value(),"successfully"));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<WrapperResponse> deleteCourse(@PathVariable Long id, HttpServletRequest request) {
        try {
            courseService.delete(id);
            return ResponseEntity.ok(new WrapperResponse(HttpStatus.OK.value(),"successfully"));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }
    @GetMapping("/details/{id}")
    public ResponseEntity<WrapperResponse> getDetailsCourse(Long courseId){
        try{
            return ResponseEntity.ok(new WrapperResponse());
        }catch (Exception e){
            throw new BaseError(e.getMessage());
        }
    }
}
