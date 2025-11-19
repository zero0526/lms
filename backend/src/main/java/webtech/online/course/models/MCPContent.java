package webtech.online.course.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mcq_contents")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MCPContent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question question;

    @Column(name = "choice_text", columnDefinition = "TEXT")
    private String choiceText;

    @Column(name = "choice_image")
    private String choiceImage;

    @Column(name = "is_correct")
    private Boolean isCorrect;
}
