package webtech.online.course.dtos.course;

import org.springframework.web.multipart.MultipartFile;

public record CourseDTO(
        Long instructorId,
        String title,
        String desc,
        MultipartFile thumbnail
) {
}
