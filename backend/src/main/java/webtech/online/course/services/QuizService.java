package webtech.online.course.services;

import webtech.online.course.dtos.course.QuizDTO;
import webtech.online.course.models.Quiz;

public interface QuizService {
    public Quiz uploadQuiz(QuizDTO quizDTO);
}
