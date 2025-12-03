package webtech.online.course.services;

import webtech.online.course.dtos.course.VideoProgressDTO;
import webtech.online.course.models.Course;
import webtech.online.course.models.Lesson;
import webtech.online.course.models.LessonProgress;
import webtech.online.course.models.User;

public interface LessonProgressService {
    public LessonProgress commit(User user, Course course, Lesson lesson, VideoProgressDTO videoProgressDTO);
}
