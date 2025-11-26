package webtech.online.course.dtos.course;

import webtech.online.course.dtos.video.VideoDTO;

import java.util.List;

public record LessonDTO(
        Long chapterId,
        String title,
        Integer order,
        String desc,
        String preCond,
        VideoDTO videoDTO,
        List<CourseMaterialDTO> courseMaterialDTOs,
        List<QuizDTO> quizDTOs
) {
}
