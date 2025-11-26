package webtech.online.course.services;

import webtech.online.course.dtos.quiz.QuizSubmissionDTO;
import webtech.online.course.models.QuizAttempt;

import java.util.List;

public interface QuizAttemptService {
    QuizAttempt startAttempt(Long quizId, Long userId);

    QuizAttempt submitAttempt(QuizSubmissionDTO submission);

    QuizAttempt getAttemptById(Long attemptId);

    List<QuizAttempt> getUserAttempts(Long userId, Long quizId);
}
