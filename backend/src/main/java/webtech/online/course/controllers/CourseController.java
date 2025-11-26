package webtech.online.course.controllers;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import webtech.online.course.dtos.course.ChapterDTO;
import webtech.online.course.dtos.course.CourseDTO;
import webtech.online.course.dtos.course.LessonDTO;
import webtech.online.course.exceptions.BaseError;
import webtech.online.course.exceptions.DefaultResponse;
import webtech.online.course.exceptions.ErrorResponse;
import webtech.online.course.models.*;
import webtech.online.course.services.ChapterService;
import webtech.online.course.services.CourseService;
import webtech.online.course.services.LessonService;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/course")
public class CourseController {
    private final CourseService courseService;
    private final LessonService lessonService;
    private final ChapterService chapterService;

    @PostMapping(value = "/post")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<DefaultResponse> postCourse(@ModelAttribute CourseDTO courseDTO, HttpServletRequest request) {
        try {
            courseService.save(Course.builder()
                    .title(courseDTO.title())
                    .description(courseDTO.desc())
                    .build(), courseDTO.instructorId(), courseDTO.thumbnail());
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.CREATED.value()));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @PutMapping("/add-chapter")
    public ResponseEntity<DefaultResponse> addChapter(@RequestBody ChapterDTO chapterDTO, HttpServletRequest request) {
        try {
            courseService.addNewChapter(chapterDTO.courseId(), Chapter.builder()
                    .order(chapterDTO.order())
                    .title(chapterDTO.title())
                    .build());
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @PutMapping("/add-lesson")
    public ResponseEntity<DefaultResponse> addLesson(@ModelAttribute LessonDTO lessonDTO, HttpServletRequest request) throws IOException {
         try{
            Lesson lesson = lessonService.insert(lessonDTO);
            chapterService.addLesson(lessonDTO.chapterId(), lesson);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
         }catch (Exception ex){
            throw new BaseError(500, ex.getMessage());
         }
    }

    @GetMapping
    public ResponseEntity<DefaultResponse> getAllCourses() {
        return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DefaultResponse> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DefaultResponse> updateCourse(@PathVariable Long id, @ModelAttribute CourseDTO courseDTO,
            HttpServletRequest request) {
        try {
            courseService.update(id, courseDTO);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<DefaultResponse> deleteCourse(@PathVariable Long id, HttpServletRequest request) {
        try {
            courseService.delete(id);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }
}
