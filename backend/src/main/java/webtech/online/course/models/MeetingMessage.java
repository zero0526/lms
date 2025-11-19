package webtech.online.course.models;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "meeting_messages")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MeetingMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private MeetingSession meetingSession;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "sent_at")
    @Builder.Default
    private LocalDateTime sentAt= LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_comment_id")
    @ToString.Exclude
    private MeetingMessage meetingMessage;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "meetingMessage", cascade = CascadeType.ALL)
    private List<MeetingMessage> meetingSessions;
}
