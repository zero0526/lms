package webtech.online.course.services.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import webtech.online.course.domains.FileInfo;
import webtech.online.course.dtos.Drive.DriveRequest;
import webtech.online.course.dtos.course.CourseMaterialDTO;
import webtech.online.course.models.CourseMaterial;
import webtech.online.course.repositories.CourseMaterialRepository;
import webtech.online.course.services.CourseMaterialService;
import webtech.online.course.services.DriveService;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class CourseMaterialServiceImpl implements CourseMaterialService {
    private final CourseMaterialRepository courseMaterialRepository;
    private final DriveService driveService;

    public CourseMaterial parser(CourseMaterialDTO courseMaterialDTO){
        try {
            FileInfo fileInfo = driveService.uploadFile(new DriveRequest(courseMaterialDTO.doc()));
            return CourseMaterial.builder()
                    .docUrl(fileInfo.urlUploaded())
                    .fileType(fileInfo.fileType())
                    .build();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
