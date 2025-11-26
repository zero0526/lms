package webtech.online.course.services.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import webtech.online.course.domains.FileInfo;
import webtech.online.course.dtos.Drive.DriveRequest;
import webtech.online.course.dtos.course.QuestionDTO;
import webtech.online.course.exceptions.BaseError;
import webtech.online.course.models.Question;
import webtech.online.course.repositories.QuestionRepository;
import webtech.online.course.services.DriveService;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class QuestionService {
    private final QuestionRepository questionRepository;
    private final DriveService driveService;

    public Question findById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new BaseError(500, "Not Found answer has id=%d".formatted(id)));
    }

    @Transactional
    public Question save(QuestionDTO questionDTO) throws IOException {
        String urlUploaded = "";
        if (!questionDTO.qImage().isEmpty()) {
            FileInfo fileInfo = driveService.uploadFile(new DriveRequest(questionDTO.qImage()));
            urlUploaded = fileInfo.urlUploaded();
        }
        return questionRepository.saveAndFlush(Question.builder()

                .questionImg(urlUploaded)
                .questionText(questionDTO.qText())
                .build());
    }

    @Transactional
    public Question update(Long id, QuestionDTO questionDTO) throws IOException {
        Question question = findById(id);
        question.setQuestionText(questionDTO.qText());
        if (questionDTO.qImage() != null && !questionDTO.qImage().isEmpty()) {
            FileInfo fileInfo = driveService.uploadFile(new DriveRequest(questionDTO.qImage()));
            question.setQuestionImg(fileInfo.urlUploaded());
        }
        return questionRepository.saveAndFlush(question);
    }

    @Transactional
    public void delete(Long id) {
        Question question = findById(id);
        questionRepository.delete(question);
    }

    public java.util.List<Question> findAll() {
        return questionRepository.findAll();
    }
}
