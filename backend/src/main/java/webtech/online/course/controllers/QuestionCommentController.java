package webtech.online.course.controllers;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import webtech.online.course.dtos.quiz.QuestionCommentDTO;
import webtech.online.course.exceptions.DefaultResponse;
import webtech.online.course.exceptions.ErrorResponse;
import webtech.online.course.exceptions.WrapperResponse;
import webtech.online.course.models.QuestionComment;
import webtech.online.course.services.QuestionCommentService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/question-comment")
public class QuestionCommentController {
    private final QuestionCommentService questionCommentService;

    @PostMapping
    public ResponseEntity<WrapperResponse> addComment(
            @RequestBody QuestionCommentDTO dto,
            @RequestParam Long userId,
            HttpServletRequest request) {
        try {
            QuestionComment comment = questionCommentService.addComment(dto, userId);
            return ResponseEntity.ok(new WrapperResponse(HttpStatus.CREATED.value(), comment));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @GetMapping("/question/{questionId}")
    public ResponseEntity<WrapperResponse> getQuestionComments(@PathVariable Long questionId) {
        List<QuestionComment> comments = questionCommentService.getQuestionComments(questionId);
        return ResponseEntity.ok(new WrapperResponse(HttpStatus.OK.value(), comments));
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<WrapperResponse> updateComment(
            @PathVariable Long commentId,
            @RequestParam String content,
            @RequestParam Long userId,
            HttpServletRequest request) {
        try {
            QuestionComment comment = questionCommentService.updateComment(commentId, content, userId);
            return ResponseEntity.ok(new WrapperResponse(HttpStatus.OK.value(), comment));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<WrapperResponse> deleteComment(
            @PathVariable Long commentId,
            @RequestParam Long userId,
            HttpServletRequest request) {
        try {
            questionCommentService.deleteComment(commentId, userId);
            return ResponseEntity.ok(new WrapperResponse(HttpStatus.OK.value(), "Comment deleted"));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }
}
