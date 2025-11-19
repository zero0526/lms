package webtech.online.course.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "lessons")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id")
    private Chapter chapter;

    private String title;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "video_id")
    private Video video;

    @OneToMany(mappedBy = "lesson",cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CourseMaterial> courseMaterials;

    @OneToMany(mappedBy = "lesson", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Quiz> quizzes;

    private Integer order;

    @Column(name = "description")
    private String description;

    @Column(name = "precondition")
    private String precondition;
}
