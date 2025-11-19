package webtech.online.course.services.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import webtech.online.course.repositories.CourseRepository;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl {
    public final CourseRepository courseRepository;

}
