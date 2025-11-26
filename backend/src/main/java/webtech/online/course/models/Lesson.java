package webtech.online.course.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
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
    @Builder.Default
    private List<CourseMaterial> courseMaterials= new ArrayList<>();

    @OneToMany(mappedBy = "lesson", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<Quiz> quizzes= new ArrayList<>();

    @Column(name = "\"order\"")
    private Integer order;

    @Column(name = "description")
    private String description;

    @Column(name = "precondition")
    private String precondition;

    public void addQuiz(Quiz quiz){
        quizzes.add(quiz);
        quiz.setLesson(this);
    }
    public void addCourseMaterials(CourseMaterial courseMaterial){
        this.courseMaterials.add(courseMaterial);
        courseMaterial.setLesson(this);
    }
}
