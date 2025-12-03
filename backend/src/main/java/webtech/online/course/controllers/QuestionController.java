package webtech.online.course.controllers;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import webtech.online.course.dtos.course.QuestionDTO;
import webtech.online.course.exceptions.DefaultResponse;
import webtech.online.course.exceptions.ErrorResponse;
import webtech.online.course.exceptions.WrapperResponse;
import webtech.online.course.models.Question;
import webtech.online.course.models.QuestionComment;
import webtech.online.course.services.impl.QuestionService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/question")
public class QuestionController {
    private final QuestionService questionService;

    @PostMapping
    public ResponseEntity<WrapperResponse> createQuestion(@ModelAttribute QuestionDTO questionDTO,
                                                          HttpServletRequest request) {
        try {
            questionService.save(questionDTO);
            return ResponseEntity.ok(new WrapperResponse(HttpStatus.CREATED.value(),"successfully"));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<WrapperResponse> getQuestionById(@PathVariable Long id) {
        Question questionComment= questionService.findById(id);
        return ResponseEntity.ok(new WrapperResponse(HttpStatus.OK.value(), questionComment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WrapperResponse> updateQuestion(@PathVariable Long id,
            @ModelAttribute QuestionDTO questionDTO, HttpServletRequest request) {
        try {
            questionService.update(id, questionDTO);
            return ResponseEntity.ok(new WrapperResponse(HttpStatus.OK.value(), "successfully"));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<WrapperResponse> deleteQuestion(@PathVariable Long id, HttpServletRequest request) {
        try {
            questionService.delete(id);
            return ResponseEntity.ok(new WrapperResponse(HttpStatus.OK.value(), "successfully"));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }
}
