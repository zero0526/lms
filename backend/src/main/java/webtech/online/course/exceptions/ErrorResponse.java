package webtech.online.course.exceptions;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@Data
@NoArgsConstructor
public class ErrorResponse {
    private LocalDateTime timestamp; // Thời gian xảy ra lỗi
    private int status;              // Mã HTTP (ví dụ: 404, 400)
    private String error;            // Tên lỗi (ví dụ: Not Found)
    private String message;          // Thông điệp chi tiết
    private String path;             // API endpoint bị lỗi

    public ErrorResponse(int status, String error, String message, String path) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }
}
