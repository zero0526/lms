package webtech.online.course.controllers;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import webtech.online.course.dtos.course.QuestionDTO;
import webtech.online.course.exceptions.DefaultResponse;
import webtech.online.course.exceptions.ErrorResponse;
import webtech.online.course.services.impl.QuestionService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/question")
public class QuestionController {
    private final QuestionService questionService;

    @PostMapping
    public ResponseEntity<DefaultResponse> createQuestion(@ModelAttribute QuestionDTO questionDTO,
            HttpServletRequest request) {
        try {
            questionService.save(questionDTO);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.CREATED.value()));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<DefaultResponse> getQuestionById(@PathVariable Long id) {
        return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DefaultResponse> updateQuestion(@PathVariable Long id,
            @ModelAttribute QuestionDTO questionDTO, HttpServletRequest request) {
        try {
            questionService.update(id, questionDTO);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<DefaultResponse> deleteQuestion(@PathVariable Long id, HttpServletRequest request) {
        try {
            questionService.delete(id);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }
}
