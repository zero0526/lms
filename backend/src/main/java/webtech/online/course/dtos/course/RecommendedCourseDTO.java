package webtech.online.course.dtos.course;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedCourseDTO {
    private Long id;

    private String thumbnailUrl;

    private Float avgRating;

    private String description;

    private Integer numUserEnrolled;

    private Integer numChapters;
}
