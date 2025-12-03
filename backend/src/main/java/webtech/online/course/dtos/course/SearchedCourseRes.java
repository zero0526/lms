package webtech.online.course.dtos.course;

import java.time.LocalDateTime;

public record SearchedCourseRes(
        Long id,
        String title,
        LocalDateTime createdAt,
        Integer numOfEnroll,
        String desc,
        String thumbnailUrl,
        Float rating,
        String instructorName
) {
}
