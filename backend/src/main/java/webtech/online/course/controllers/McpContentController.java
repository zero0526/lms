package webtech.online.course.controllers;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import webtech.online.course.dtos.course.McqContentDTO;
import webtech.online.course.exceptions.DefaultResponse;
import webtech.online.course.exceptions.ErrorResponse;
import webtech.online.course.services.impl.McqContentServiceImpl;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mcp-content")
public class McpContentController {
    private final McqContentServiceImpl mcqContentService;

    @PostMapping
    public ResponseEntity<DefaultResponse> createMcpContent(@ModelAttribute McqContentDTO mcqContentDTO,
            HttpServletRequest request) {
        try {
            mcqContentService.save(mcqContentDTO);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.CREATED.value()));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @GetMapping
    public ResponseEntity<DefaultResponse> getAllMcpContents() {
        return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DefaultResponse> getMcpContentById(@PathVariable Long id) {
        return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DefaultResponse> updateMcpContent(@PathVariable Long id,
            @ModelAttribute McqContentDTO mcqContentDTO, HttpServletRequest request) {
        try {
            mcqContentService.update(id, mcqContentDTO);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<DefaultResponse> deleteMcpContent(@PathVariable Long id, HttpServletRequest request) {
        try {
            mcqContentService.delete(id);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }
}
