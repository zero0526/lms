package webtech.online.course.controllers;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import webtech.online.course.dtos.course.CourseMaterialDTO;
import webtech.online.course.dtos.course.LessonDTO;
import webtech.online.course.dtos.course.QuizDTO;
import webtech.online.course.exceptions.DefaultResponse;
import webtech.online.course.exceptions.ErrorResponse;
import webtech.online.course.services.LessonService;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/lesson")
public class LessonController {
    private final LessonService lessonService;

    @PostMapping
    public ResponseEntity<DefaultResponse> createLesson(@ModelAttribute LessonDTO lessonDTO,
            HttpServletRequest request) {
        try {
            lessonService.insert(lessonDTO);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.CREATED.value()));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @GetMapping
    public ResponseEntity<DefaultResponse> getAllLessons() {
        return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DefaultResponse> getLessonById(@PathVariable Long id) {
        return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DefaultResponse> updateLesson(@PathVariable Long id, @ModelAttribute LessonDTO lessonDTO,
            HttpServletRequest request) {
        try {
            lessonService.update(id, lessonDTO);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<DefaultResponse> deleteLesson(@PathVariable Long id, HttpServletRequest request) {
        try {
            lessonService.delete(id);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @PutMapping("/{id}/add-quiz")
    public ResponseEntity<DefaultResponse> addQuiz(@PathVariable Long id, @RequestBody QuizDTO quizDTO,
            HttpServletRequest request) {
        try {
            lessonService.addQuiz(id, quizDTO);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @PutMapping("/{id}/add-material")
    public ResponseEntity<DefaultResponse> addCourseMaterial(@PathVariable Long id,
            @ModelAttribute CourseMaterialDTO courseMaterialDTO, HttpServletRequest request) {
        try {
            lessonService.addCourseMaterial(id, courseMaterialDTO);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }
}
