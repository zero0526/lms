package webtech.online.course.controllers;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import webtech.online.course.dtos.quiz.QuizAttemptDTO;
import webtech.online.course.dtos.quiz.QuizSubmissionDTO;
import webtech.online.course.exceptions.DefaultResponse;
import webtech.online.course.exceptions.ErrorResponse;
import webtech.online.course.services.QuizAttemptService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/quiz-attempt")
public class QuizAttemptController {
    private final QuizAttemptService quizAttemptService;

    @PostMapping("/start")
    public ResponseEntity<DefaultResponse> startAttempt(@RequestBody QuizAttemptDTO dto, HttpServletRequest request) {
        try {
            var attempt = quizAttemptService.startAttempt(dto.quizId(), dto.userId());
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.CREATED.value(), "Quiz attempt started", attempt));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @PostMapping("/submit")
    public ResponseEntity<DefaultResponse> submitAttempt(@RequestBody QuizSubmissionDTO submission,
            HttpServletRequest request) {
        try {
            var attempt = quizAttemptService.submitAttempt(submission);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value(), "Quiz submitted and graded", attempt));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @GetMapping("/{attemptId}")
    public ResponseEntity<DefaultResponse> getAttempt(@PathVariable Long attemptId) {
        var attempt = quizAttemptService.getAttemptById(attemptId);
        return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value(), "success", attempt));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<DefaultResponse> getUserAttempts(
            @PathVariable Long userId,
            @RequestParam(required = false) Long quizId) {
        var attempts = quizAttemptService.getUserAttempts(userId, quizId);
        return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value(), "success", attempts));
    }
}
