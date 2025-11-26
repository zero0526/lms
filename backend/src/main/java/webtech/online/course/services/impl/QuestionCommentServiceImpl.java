package webtech.online.course.services.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import webtech.online.course.dtos.quiz.QuestionCommentDTO;
import webtech.online.course.exceptions.BaseError;
import webtech.online.course.models.Question;
import webtech.online.course.models.QuestionComment;
import webtech.online.course.models.User;
import webtech.online.course.repositories.QuestionCommentRepository;
import webtech.online.course.repositories.QuestionRepository;
import webtech.online.course.repositories.UserRepository;
import webtech.online.course.services.NotificationService;
import webtech.online.course.services.QuestionCommentService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionCommentServiceImpl implements QuestionCommentService {
    private final QuestionCommentRepository questionCommentRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public QuestionComment addComment(QuestionCommentDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseError(404, "User not found with id=" + userId));

        Question question = questionRepository.findById(dto.questionId())
                .orElseThrow(() -> new BaseError(404, "Question not found with id=" + dto.questionId()));

        QuestionComment.QuestionCommentBuilder builder = QuestionComment.builder()
                .question(question)
                .user(user)
                .Content(dto.content())
                .isEdited(false);

        // If this is a reply to another comment
        if (dto.parentCommentId() != null) {
            QuestionComment parentComment = questionCommentRepository.findById(dto.parentCommentId())
                    .orElseThrow(() -> new BaseError(404, "Parent comment not found with id=" + dto.parentCommentId()));
            builder.questionComment(parentComment);

            // Notify the parent comment author
            if (!parentComment.getUser().getId().equals(userId)) {
                notificationService.createNotification(
                        parentComment.getUser().getId(),
                        "New Reply",
                        user.getUsername() + " replied to your comment",
                        "/question/" + dto.questionId() + "/comment/" + dto.parentCommentId());
            }
        } else {
            // This is a top-level comment
            // Notify all users who have commented on this question (implicit follow)
            List<QuestionComment> existingComments = questionCommentRepository.findByQuestionId(dto.questionId());
            Set<Long> userIdsToNotify = existingComments.stream()
                    .map(c -> c.getUser().getId())
                    .filter(id -> !id.equals(userId))
                    .collect(Collectors.toSet());

            for (Long userIdToNotify : userIdsToNotify) {
                notificationService.createNotification(
                        userIdToNotify,
                        "New Comment on Question",
                        user.getUsername() + " commented on a question you're following",
                        "/question/" + dto.questionId());
            }
        }

        QuestionComment comment = builder.build();
        return questionCommentRepository.save(comment);
    }

    @Override
    public List<QuestionComment> getQuestionComments(Long questionId) {
        // Return only top-level comments (those without a parent)
        return questionCommentRepository.findByQuestionIdAndQuestionCommentIsNull(questionId);
    }

    @Override
    @Transactional
    public QuestionComment updateComment(Long commentId, String content, Long userId) {
        QuestionComment comment = questionCommentRepository.findById(commentId)
                .orElseThrow(() -> new BaseError(404, "Comment not found with id=" + commentId));

        if (!comment.getUser().getId().equals(userId)) {
            throw new BaseError(403, "You can only edit your own comments");
        }

        comment.setContent(content);
        comment.setIsEdited(true);
        comment.setUpdatedAt(LocalDateTime.now());

        return questionCommentRepository.save(comment);
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        QuestionComment comment = questionCommentRepository.findById(commentId)
                .orElseThrow(() -> new BaseError(404, "Comment not found with id=" + commentId));

        if (!comment.getUser().getId().equals(userId)) {
            throw new BaseError(403, "You can only delete your own comments");
        }

        questionCommentRepository.delete(comment);
    }
}
