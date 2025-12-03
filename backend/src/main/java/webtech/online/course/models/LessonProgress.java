package webtech.online.course.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "lesson_progress")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LessonProgress {
    @EmbeddedId
    private LessonProgressId id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId("lessonId")
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(name = "progress_video")
    @Builder.Default
    private Float progressVideo=0.0F;
    @Builder.Default
    @Column(name = "progress_quiz")
    private Float progressQuiz=0.0f;

    @Column(name = "last_watched_at_second")
    private Long lastWatchedAtSecond;

    @Column(name = "first_watched_at")
    @Builder.Default
    private LocalDateTime firstWatchedAt= LocalDateTime.now();
}
