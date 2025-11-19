package webtech.online.course.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import webtech.online.course.enums.MeetingSessionStatus;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "meeting_sessions")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MeetingSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "meeting_id")
    private Meeting meeting;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;
    @Column(name = "ended_at")
    private LocalDateTime endedAt;


    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MeetingSessionStatus status= MeetingSessionStatus.UPCOMING;

    @Column(name = "actual_duration", columnDefinition = "interval")
    private Duration actualDuration;



}

