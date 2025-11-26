package webtech.online.course.dtos.course;

import org.springframework.web.multipart.MultipartFile;

public record McqContentDTO(
        String cText,
        MultipartFile cImage,
        Boolean isCorrect
) {
}
