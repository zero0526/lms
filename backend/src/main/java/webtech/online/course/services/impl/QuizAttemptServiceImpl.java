package webtech.online.course.services.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import webtech.online.course.dtos.quiz.AnswerSubmissionDTO;
import webtech.online.course.dtos.quiz.QuizSubmissionDTO;
import webtech.online.course.exceptions.BaseError;
import webtech.online.course.models.*;
import webtech.online.course.repositories.*;
import webtech.online.course.services.QuizAttemptService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizAttemptServiceImpl implements QuizAttemptService {
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final QuestionResponseRepository questionResponseRepository;
    private final QuestionRepository questionRepository;
    private final McqContentRepository mcqContentRepository;

    @Override
    @Transactional
    public QuizAttempt startAttempt(Long quizId, Long userId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new BaseError(404, "Quiz not found with id=" + quizId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseError(404, "User not found with id=" + userId));

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz);
        attempt.setUser(user);
        attempt.setStartedAt(LocalDateTime.now());
        attempt.setIsCompleted(false);

        return quizAttemptRepository.saveAndFlush(attempt);
    }

    @Override
    @Transactional
    public QuizAttempt submitAttempt(QuizSubmissionDTO submission) {
        QuizAttempt attempt = quizAttemptRepository.findById(submission.attemptId())
                .orElseThrow(() -> new BaseError(404, "Quiz attempt not found with id=" + submission.attemptId()));

        if (attempt.getIsCompleted()) {
            throw new BaseError(400, "Quiz attempt already completed");
        }

        float totalScore = 0f;

        // Process each answer
        for (AnswerSubmissionDTO answer : submission.answers()) {
            Question question = questionRepository.findById(answer.questionId())
                    .orElseThrow(() -> new BaseError(404, "Question not found with id=" + answer.questionId()));

            // Get all correct choices for this question
            List<MCPContent> correctChoices = question.getMcpContents().stream()
                    .filter(MCPContent::getIsCorrect)
                    .toList();

            // Check if user's answer is correct
            boolean isCorrect = checkAnswer(answer.selectedChoiceIds(), correctChoices);
            float scoreAwarded = isCorrect ? (question.getScore() != null ? question.getScore() : 0f) : 0f;
            totalScore += scoreAwarded;

            // Save each selected choice as a response
            for (Long choiceId : answer.selectedChoiceIds()) {
                MCPContent selectedChoice = mcqContentRepository.findById(choiceId)
                        .orElseThrow(() -> new BaseError(404, "Choice not found with id=" + choiceId));

                QuestionResponse response = QuestionResponse.builder()
                        .quizAttempt(attempt)
                        .question(question)
                        .isCorrect(selectedChoice.getIsCorrect())
                        .isSelected(true)
                        .scoreAwarded(isCorrect ? scoreAwarded : 0f)
                        .build();

                questionResponseRepository.save(response);
            }
        }

        // Update attempt with final score
        attempt.setTotalScore(totalScore);
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setIsCompleted(true);

        return quizAttemptRepository.saveAndFlush(attempt);
    }

    private boolean checkAnswer(List<Long> selectedChoiceIds, List<MCPContent> correctChoices) {
        if (selectedChoiceIds.size() != correctChoices.size()) {
            return false;
        }

        List<Long> correctChoiceIds = correctChoices.stream()
                .map(MCPContent::getId)
                .toList();

        return selectedChoiceIds.containsAll(correctChoiceIds) &&
                correctChoiceIds.containsAll(selectedChoiceIds);
    }

    @Override
    public QuizAttempt getAttemptById(Long attemptId) {
        return quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new BaseError(404, "Quiz attempt not found with id=" + attemptId));
    }

    @Override
    public List<QuizAttempt> getUserAttempts(Long userId, Long quizId) {
        if (quizId != null) {
            return quizAttemptRepository.findByUserIdAndQuizId(userId, quizId);
        }
        return quizAttemptRepository.findByUserId(userId);
    }
}
