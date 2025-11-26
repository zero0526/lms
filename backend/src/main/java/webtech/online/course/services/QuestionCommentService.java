package webtech.online.course.services;

import webtech.online.course.dtos.quiz.QuestionCommentDTO;
import webtech.online.course.models.QuestionComment;

import java.util.List;

public interface QuestionCommentService {
    QuestionComment addComment(QuestionCommentDTO dto, Long userId);

    List<QuestionComment> getQuestionComments(Long questionId);

    QuestionComment updateComment(Long commentId, String content, Long userId);

    void deleteComment(Long commentId, Long userId);
}
