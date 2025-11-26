package webtech.online.course.services;

import webtech.online.course.dtos.course.CourseMaterialDTO;
import webtech.online.course.models.CourseMaterial;

public interface CourseMaterialService {
    public CourseMaterial parser(CourseMaterialDTO courseMaterialDTO);
}
