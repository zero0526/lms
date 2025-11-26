package webtech.online.course.controllers;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import webtech.online.course.dtos.quiz.QuestionCommentDTO;
import webtech.online.course.exceptions.DefaultResponse;
import webtech.online.course.exceptions.ErrorResponse;
import webtech.online.course.services.QuestionCommentService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/question-comment")
public class QuestionCommentController {
    private final QuestionCommentService questionCommentService;

    @PostMapping
    public ResponseEntity<DefaultResponse> addComment(
            @RequestBody QuestionCommentDTO dto,
            @RequestParam Long userId,
            HttpServletRequest request) {
        try {
            var comment = questionCommentService.addComment(dto, userId);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.CREATED.value(), "Comment added", comment));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @GetMapping("/question/{questionId}")
    public ResponseEntity<DefaultResponse> getQuestionComments(@PathVariable Long questionId) {
        var comments = questionCommentService.getQuestionComments(questionId);
        return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value(), "success", comments));
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<DefaultResponse> updateComment(
            @PathVariable Long commentId,
            @RequestParam String content,
            @RequestParam Long userId,
            HttpServletRequest request) {
        try {
            var comment = questionCommentService.updateComment(commentId, content, userId);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value(), "Comment updated", comment));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<DefaultResponse> deleteComment(
            @PathVariable Long commentId,
            @RequestParam Long userId,
            HttpServletRequest request) {
        try {
            questionCommentService.deleteComment(commentId, userId);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value(), "Comment deleted"));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }
}
