package webtech.online.course.controllers;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import webtech.online.course.dtos.course.ChapterDTO;
import webtech.online.course.exceptions.DefaultResponse;
import webtech.online.course.exceptions.ErrorResponse;
import webtech.online.course.services.ChapterService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chapter")
public class ChapterController {
    private final ChapterService chapterService;

    @PostMapping
    public ResponseEntity<DefaultResponse> createChapter(@RequestBody ChapterDTO chapterDTO,
            HttpServletRequest request) {
        try {
            chapterService.save(chapterDTO);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.CREATED.value()));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<DefaultResponse> getChapterById(@PathVariable Long id) {
        return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DefaultResponse> updateChapter(@PathVariable Long id, @RequestBody ChapterDTO chapterDTO,
            HttpServletRequest request) {
        try {
            chapterService.update(id, chapterDTO);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<DefaultResponse> deleteChapter(@PathVariable Long id, HttpServletRequest request) {
        try {
            chapterService.delete(id);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }
}
