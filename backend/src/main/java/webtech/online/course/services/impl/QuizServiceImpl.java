package webtech.online.course.services.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import webtech.online.course.domains.FileInfo;
import webtech.online.course.dtos.Drive.DriveRequest;
import webtech.online.course.dtos.course.QuizDTO;
import webtech.online.course.models.MCPContent;
import webtech.online.course.models.Question;
import webtech.online.course.models.Quiz;
import webtech.online.course.repositories.QuizRepository;
import webtech.online.course.services.DriveService;
import webtech.online.course.services.QuizService;

import java.io.IOException;
import java.util.List;

import static java.util.stream.Collectors.toList;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {
    private final QuizRepository quizRepository;
    private final DriveService driveService;

    @Transactional
    public Quiz uploadQuiz(QuizDTO quizDTO){
        Quiz quiz= Quiz.builder()
                .title(quizDTO.title())
                .precondition(quizDTO.precondition())
                .precondition(quizDTO.precondition())
                .timeLimitMinutes(quizDTO.timeLimitMinutes())
                .difficultyAvg(quizDTO.difficultyAvg())
                .build();
        List<Question> qs= quizDTO.questions().stream().map(
                qDTO-> {
                    String uploadedUrl= "";
                    if(!qDTO.qImage().isEmpty()){
                        try {
                            FileInfo fInfo = driveService.uploadFile(new DriveRequest(qDTO.qImage()));
                            uploadedUrl= fInfo.urlUploaded();
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }

                    }
                    Question question=  Question.builder()
                            .questionText(qDTO.qText())
                            .questionImg(uploadedUrl)
                            .level(qDTO.level())
                            .explanation(qDTO.explanation())
                            .score(qDTO.score())
                            .order(qDTO.order())
                            .build();
                    List<MCPContent> mcpContents= qDTO.mcqContents().stream().map(
                            mcq->{
                                String uploadedMCPUrl= "";
                                if(!mcq.cImage().isEmpty()){
                                    FileInfo fImgInfo = null;
                                    try {
                                        fImgInfo = driveService.uploadFile(new DriveRequest(mcq.cImage()));
                                    } catch (IOException e) {
                                        throw new RuntimeException(e);
                                    }
                                    uploadedMCPUrl= fImgInfo.urlUploaded();
                                }
                                MCPContent mcpC=  MCPContent.builder()
                                        .isCorrect(mcq.isCorrect())
                                        .choiceImage(uploadedMCPUrl)
                                        .choiceText(mcq.cText())
                                        .build();
                                question.addMcpContent(mcpC);
                                return mcpC;
                            }
                    ).toList();

                    quiz.addQuestion(question);
                    return question;
                }
        ).toList();
        quiz.setQuestions(qs);
        return quiz;
    }
}
