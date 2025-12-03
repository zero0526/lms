package webtech.online.course.repositories;

import jakarta.persistence.*;
import jakarta.websocket.server.PathParam;
import lombok.Builder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import webtech.online.course.dtos.course.*;
import webtech.online.course.models.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    @Query(
            """
            SELECT c.id, AVG(rc.rating)
            FROM Course c
            JOIN ReviewCourse rc ON rc.course.id=c.id
            WHERE c.id not in (
                SELECT e.course.id
                FROM Enrollment e
                WHERE e.user.id= :userId
            )
            GROUP BY c.id
            HAVING AVG(rc.rating) > :userBias
            """
    )
    public Map<String, Object> findExpectedCourse(@PathParam("userId") Long userId, @PathParam("meanGlobal") Double meanGlobal, @PathParam("mg") Double userBias);

    @Query("""
        SELECT
            c.id,
            c.thumbnailUrl,
            AVG(rc.rating),
            c.description,
            COUNT(DISTINCT e),
            COUNT(DISTINCT ch)
        FROM Course c
        LEFT JOIN c.reviewCourses rc
        LEFT JOIN c.enrollments e
        LEFT JOIN c.chapters ch
        WHERE c.id = :courseId
        GROUP BY c.id, c.thumbnailUrl, c.description
    """)
    public RecommendedCourseDTO findRecommendCourse(@Param("courseId") Long courseId);

    @Query("""
            SELECT 
                c.id, c.thumbnailUrl, c.title, c.description,
                AVG(lp.progressVideo*0.5 + lp.progressQuiz*0.5)
            FROM Enrollment e
            JOIN e.course c
            JOIN LessonProgress lp ON lp.user.id = e.user.id AND lp.course.id = c.id
            WHERE e.user.id = :userId
            GROUP BY c.id, c.thumbnailUrl, c.title, c.description
        """)
    public List<MyCourseDTO> findMyCourse(@Param("userId") Long userId);

    @Query(
            """
            SELECT c.title FROM Course c        
            """
    )
    public List<String> getAllCourseTitles();


    @Query("""
        SELECT c.id as id,
               c.title as title,
               c.createdAt as createdAt,
               COUNT(DISTINCT e.id) as numOfEnroll,
               c.description as description,
               c.thumbnailUrl as thumbnailUrl,
               AVG(rc.rating) as rating,
               u.fullName as instructorName
        FROM Course c
        JOIN c.instructor u
        LEFT JOIN ReviewCourse rc ON rc.course.id = c.id
        LEFT JOIN Enrollment e ON e.course.id = c.id
        WHERE c.id IN :ids
        GROUP BY c.id, c.title, c.createdAt, c.description, c.thumbnailUrl, u.fullName
    """)
    List<SearchedCourseRes> findSearchCourseByIds(@Param("ids") List<Long> ids);


    @Query(
            """
               SELECT c.thumbnailUrl, c.title, c.description, c.precondition, c.courseTarget, c.tags, c.instructor.fullName, c.instructor.pictureUrl, c.instructor.id
               FROM Course c
               WHERE c.id= :courseId
            """
    )
    DetailsCourseDTO findDetailsCourse(@Param("courseId") Long courseId);

//    @Query(
//            """
//            SELECT ch.title as chapterTitle, l.id as lessonId, l.title as lessonTitle, v.duration as originalVideoDuration, lp.lastWatchedAtSecond
//            FROM LessonProgress lp ON lp.i
//            WHERE lp.course.id = :courseId and lp.user.id=:userId
//            ORDER BY
//            """
//    )
//    LessonOutlineFlat getOutlineCourse(@Param("courseId") Long courseId, @Param("userId") Long userId);
}
