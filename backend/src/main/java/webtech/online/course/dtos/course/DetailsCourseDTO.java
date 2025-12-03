package webtech.online.course.dtos.course;

import java.util.List;

public record DetailsCourseDTO(
        String thumbnailUrl,
        String title,
        String desc,
        String preconditions,
        String courseTargets,
        List<String> tags,
        String teacherName,
        String teachAvatarUrl,
        Long instructorId
) {
}
