package webtech.online.course.services.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import webtech.online.course.domains.FileInfo;
import webtech.online.course.dtos.Drive.DriveRequest;
import webtech.online.course.dtos.course.McqContentDTO;
import webtech.online.course.exceptions.BaseError;
import webtech.online.course.models.MCPContent;
import webtech.online.course.repositories.McqContentRepository;
import webtech.online.course.services.DriveService;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class McqContentServiceImpl {
    private final McqContentRepository mcqContentRepository;
    private final DriveService driveService;

    public MCPContent findById(Long id) {
        return mcqContentRepository.findById(id)
                .orElseThrow(() -> new BaseError(500, "Not Found answer has id=%d".formatted(id)));
    }

    @Transactional
    public MCPContent save(McqContentDTO mcqContentDTO) throws IOException {
        String urlUploaded = "";
        if (!mcqContentDTO.cImage().isEmpty()) {
            FileInfo fileInfo = driveService.uploadFile(new DriveRequest(mcqContentDTO.cImage()));
            urlUploaded = fileInfo.urlUploaded();
        }
        return mcqContentRepository.saveAndFlush(MCPContent.builder()
                .choiceImage(urlUploaded)
                .choiceText(mcqContentDTO.cText())
                .isCorrect(mcqContentDTO.isCorrect())
                .build());
    }

    @Transactional
    public MCPContent update(Long id, McqContentDTO mcqContentDTO) throws IOException {
        MCPContent mcpContent = findById(id);
        mcpContent.setChoiceText(mcqContentDTO.cText());
        mcpContent.setIsCorrect(mcqContentDTO.isCorrect());
        if (mcqContentDTO.cImage() != null && !mcqContentDTO.cImage().isEmpty()) {
            FileInfo fileInfo = driveService.uploadFile(new DriveRequest(mcqContentDTO.cImage()));
            mcpContent.setChoiceImage(fileInfo.urlUploaded());
        }
        return mcqContentRepository.saveAndFlush(mcpContent);
    }

    @Transactional
    public void delete(Long id) {
        MCPContent mcpContent = findById(id);
        mcqContentRepository.delete(mcpContent);
    }

    public java.util.List<MCPContent> findAll() {
        return mcqContentRepository.findAll();
    }
}
