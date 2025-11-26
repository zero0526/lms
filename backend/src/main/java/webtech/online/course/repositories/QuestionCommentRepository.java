package webtech.online.course.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import webtech.online.course.models.QuestionComment;

import java.util.List;

@Repository
public interface QuestionCommentRepository extends JpaRepository<QuestionComment, Long> {
    List<QuestionComment> findByQuestionIdAndQuestionCommentIsNull(Long questionId);

    List<QuestionComment> findByQuestionCommentId(Long parentCommentId);

    List<QuestionComment> findByQuestionId(Long questionId);
}
