package webtech.online.course.dtos.video;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public record VideoDTO (
        String title,
        MultipartFile video,
        List<SegmentDTO> segmentDTOs
){

}
