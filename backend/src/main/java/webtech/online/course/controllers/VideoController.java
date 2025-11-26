package webtech.online.course.controllers;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import webtech.online.course.dtos.video.VideoDTO;
import webtech.online.course.exceptions.DefaultResponse;
import webtech.online.course.exceptions.ErrorResponse;
import webtech.online.course.services.VideoService;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/video")
public class VideoController {
    private final VideoService videoService;

    @PostMapping
    public ResponseEntity<DefaultResponse> uploadVideo(@ModelAttribute VideoDTO videoDTO, HttpServletRequest request) {
        try {
            videoService.uploadVideo(videoDTO);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.CREATED.value()));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<DefaultResponse> getVideoById(@PathVariable Long id) {
        return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DefaultResponse> updateVideo(@PathVariable Long id, @ModelAttribute VideoDTO videoDTO,
            HttpServletRequest request) {
        try {
            videoService.update(id, videoDTO);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<DefaultResponse> deleteVideo(@PathVariable Long id, HttpServletRequest request) {
        try {
            videoService.delete(id);
            return ResponseEntity.ok(new DefaultResponse(HttpStatus.OK.value()));
        } catch (Exception ex) {
            throw new ErrorResponse(500, ex.getMessage(), request.getRequestURI());
        }
    }
}
