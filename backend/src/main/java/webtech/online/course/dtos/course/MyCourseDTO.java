package webtech.online.course.dtos.course;

public record MyCourseDTO(
        Long courseId,
        String thumbnailUrl,
        String title,
        String description,
        Float progress
) {
}
