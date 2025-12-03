package webtech.online.course.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import webtech.online.course.models.ReviewCourse;

import java.util.List;
import java.util.Map;

@Repository
public interface ReviewCourseRepository extends JpaRepository<ReviewCourse, Long> {
    @Query("SELECT AVG(r.rating) FROM ReviewCourse r")
    Double findGlobalMeanRating();
    @Query("SELECT AVG(r.rating - :globalMean) FROM ReviewCourse r WHERE r.user.id= :userId")
    Double findUserBias(@Param("userId") Long userId, @Param("globalMean") Double globalMean);

    @Query("""
        SELECT c.id AS courseId,
               AVG(r.rating - :globalMean) AS itemBias
        FROM Course c
        LEFT JOIN ReviewCourse r ON r.course.id = c.id
        WHERE c.id NOT IN (
            SELECT e.course.id FROM Enrollment e WHERE e.user.id = :userId
        )
        GROUP BY c.id
    """)
    List<Map<String, Object>> findAllItemBias(@Param("globalMean") Double globalMean,
                                              @Param("userId") Long userId);
}
