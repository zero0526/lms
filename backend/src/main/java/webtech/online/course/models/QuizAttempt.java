package webtech.online.course.models;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "quiz_attempts")
public class QuizAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    @Column(name = "started_at")
    private LocalDateTime startedAt;
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
    @Column(name = "total_score")
    private Float totalScore;
    @Column(name = "is_completed")
    private Boolean isCompleted= Boolean.FALSE;

}