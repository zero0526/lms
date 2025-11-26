package webtech.online.course.dtos.course;

import org.springframework.web.multipart.MultipartFile;

public record CourseMaterialDTO(
        MultipartFile doc,
        String title
        )
{
}
