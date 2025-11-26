package webtech.online.course.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "question", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<MCPContent> mcpContents= new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    @Column(name = "question_text")
    private String questionText;

    @Column(name = "question_image")
    private String questionImg;

    private String level;

    private Float score;

    @Column(name = "\"order\"")
    private Integer order;

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    public void addMcpContent(MCPContent mcpContent){
        this.mcpContents.add(mcpContent);
        mcpContent.setQuestion(this);
    }
}
