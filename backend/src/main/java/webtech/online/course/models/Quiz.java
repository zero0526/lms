package webtech.online.course.models;


import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "quizzes")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;
    
    @OneToMany(mappedBy = "quiz", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Question> questions;

    @OneToMany(mappedBy = "quiz", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<QuizAttempt> quizAttempts;

    private String title;

    private String precondition;

    private String description;

    @Column(name = "time_limit_minutes")
    private String timeLimitMinutes;
    
    @Column(name = "difficulty_avg")
    private String difficultyAvg;
    
    @Column(name = "total_score")
    private Integer totalScore;
}


