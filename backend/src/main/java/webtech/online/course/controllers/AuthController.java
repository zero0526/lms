package webtech.online.course.controllers;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import webtech.online.course.dtos.LoginRequest;
import webtech.online.course.dtos.RegisterRequest;
import webtech.online.course.enums.UserStatus;
import webtech.online.course.models.User;
import webtech.online.course.models.UserSession;
import webtech.online.course.models.VerificationToken;
import webtech.online.course.security.JwtService;
import webtech.online.course.security.UserDetailsServiceImpl;
import webtech.online.course.services.EmailService;
import webtech.online.course.services.UserService;
import webtech.online.course.services.VerificationTokenService;
import webtech.online.course.services.UserSessionService;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsServiceImpl;
    private final UserService userService;
    private final UserSessionService userSessionService;
    private final VerificationTokenService verificationTokenService;
    private final EmailService emailService;

//    @PreAuthorize("hasAuthority('ROLE_TEACHER')")
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request, HttpServletRequest httpServletRequest) {
        try{
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            UserDetails userDetails = userDetailsServiceImpl.loadUserByUsername(request.getEmail());
            String accessToken = jwtService.generateToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);
            User user= userService.confirmOriginalLogin(request.getEmail(), request.getRole().getRole());
            if(user==null) throw new UsernameNotFoundException("Not found the user has email, role is provided");
            userSessionService.enforceMaxSession(user, 1);

            UserSession session = UserSession.builder()
                    .user(user)
                    .refreshToken(refreshToken)
                    .ipAddress(httpServletRequest.getRemoteAddr())
                    .build();
            userSessionService.save(session);
            Map<String, String> tokens = new HashMap<>();
            tokens.put("access_token", accessToken);
            tokens.put("refresh_token", refreshToken);

            return ResponseEntity.ok(tokens);
        }
        catch (BadCredentialsException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        } catch (UsernameNotFoundException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not found"));
        } catch (DisabledException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Account disabled"));
        } catch (LockedException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Account locked"));
        }
        catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(request);
            VerificationToken token= userService.createVerificationToken(user);
            emailService.sendSimpleMessage(user, token);
            return ResponseEntity.ok("To complete your registration, please verify your account using the link we sent to your email.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refresh_token");
        String username = jwtService.extractUsername(refreshToken);
        UserDetails user = userDetailsServiceImpl.loadUserByUsername(username);

        if (jwtService.isTokenValid(refreshToken, user)) {
            String newAccessToken = jwtService.generateToken(user);
            Map<String, String> response = new HashMap<>();
            response.put("access_token", newAccessToken);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Invalid refresh token"));
        }
    }
    @GetMapping("/verify")
    public ResponseEntity<?> verifyAccount(@RequestParam("token") String token) {
        VerificationToken verificationToken = verificationTokenService.findByToken(token);

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Token đã hết hạn");
        }

        User user = verificationToken.getUser();
        user.setStatus(UserStatus.ACTIVE);
        userService.save(user);

        verificationTokenService.delete(verificationToken);

        return ResponseEntity.ok("Tài khoản đã được xác minh thành công!");
    }

}
