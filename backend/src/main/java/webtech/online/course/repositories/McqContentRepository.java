package webtech.online.course.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import webtech.online.course.models.MCPContent;

@Repository
public interface McqContentRepository extends JpaRepository<MCPContent, Long> {
}
