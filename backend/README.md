src
└── main
├── java
│   └── com
│       └── yourcompany
│           └── onlinecourse
│               ├── OnlineCourseSystemApplication.java  // (1) Điểm khởi đầu
│               ├── config/                           // (2) Cấu hình hệ thống
│               │   ├── SecurityConfig.java
│               │   ├── WebConfig.java
│               │   └── ApplicationConfig.java
│               ├── controller/                       // (3) Tầng API (Web Layer)
│               │   ├── AuthController.java
│               │   └── SubscriptionController.java
│               ├── model/ (hoặc entity)              // (4) Tầng Dữ liệu (Domain Layer)
│               │   ├── User.java
│               │   ├── UserSession.java
│               │   └── Subscription.java
│               ├── repository/                       // (5) Tầng Truy cập Dữ liệu
│               │   ├── UserRepository.java
│               │   ├── UserSessionRepository.java
│               │   └── SubscriptionRepository.java
│               ├── service/                          // (6) Tầng Logic nghiệp vụ
│               │   ├── impl/
│               │   │   ├── AuthServiceImpl.java
│               │   │   └── JwtServiceImpl.java
│               │   ├── AuthService.java
│               │   ├── JwtService.java
│               │   └── SubscriptionService.java
│               ├── dto/                              // (7) Đối tượng Truyền dữ liệu
│               │   ├── AuthResponse.java
│               │   ├── LoginRequest.java
│               │   └── RegisterRequest.java
│               └── security/                         // (8) Các thành phần Bảo mật
│                   ├── JwtAuthenticationFilter.java
│                   └── UserDetailsServiceImpl.java
└── resources
├── application.properties (hoặc .yml)          // (9) Cấu hình ứng dụng
├── static/
└── templates/
pom.xml                                               // (10) Quản lý thư viện và dự án