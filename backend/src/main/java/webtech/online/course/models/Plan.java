package webtech.online.course.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

@Entity
@Table(name = "plan")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Plan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "price")
    private Float price;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "max_devices")
    private Integer maxDevice= 1;

    @Column(name = "features", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> features;

    @Column(name = "is_active")
    private Boolean isActive= Boolean.TRUE;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "")
}
