package webtech.online.course.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "question_comments")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionComment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    private Question question;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @ToString.Exclude
    @JoinColumn(name = "child_comment_id")
    private QuestionComment questionComment;

    @OneToMany(mappedBy = "questionComment",fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<QuestionComment> childComments;

    @Column(name = "content", columnDefinition = "TEXT")
    private String Content;

    @Column(name = "is_edited")
    private Boolean isEdited;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt= LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt= LocalDateTime.now();
}
