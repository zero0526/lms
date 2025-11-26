package webtech.online.course.dtos.course;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public record QuestionDTO(
        MultipartFile qImage,
        String qText,
        String explanation,
        String level,
        Float score,
        Integer order,
        List<McqContentDTO> mcqContents
) {
}
