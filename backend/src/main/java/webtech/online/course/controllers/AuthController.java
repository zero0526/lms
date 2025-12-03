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
import webtech.online.course.dtos.User.BaseUserDTO;
import webtech.online.course.enums.UserStatus;
import webtech.online.course.exceptions.BaseError;
import webtech.online.course.exceptions.WrapperResponse;
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

    @PostMapping("/login")
    public ResponseEntity<WrapperResponse> login(@RequestBody LoginRequest request, HttpServletRequest httpServletRequest) {
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

            return ResponseEntity.ok(new WrapperResponse(HttpStatus.OK.value(),
                    new BaseUserDTO(user.getId(), user.getFullName(), user.getEmail(), user.getRole().getName(),
                            user.getPictureUrl(), accessToken, refreshToken)));
        }
        catch (Exception e) {
            throw new BaseError(e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<WrapperResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(request);
            VerificationToken token= userService.createVerificationToken(user);
            emailService.sendSimpleMessage(user, token);
            return ResponseEntity.ok(new WrapperResponse(HttpStatus.CREATED.value(), "To complete your registration, please verify your account using the link we sent to your email."));
        } catch (Exception e) {
            throw new BaseError(e.getMessage());
        }
    }
    @PostMapping("/refresh")
    public ResponseEntity<WrapperResponse> refresh(@RequestBody String refreshToken) {
        String username = jwtService.extractUsername(refreshToken);
        UserDetails user = userDetailsServiceImpl.loadUserByUsername(username);

        if (jwtService.isTokenValid(refreshToken, user)) {
            String newAccessToken = jwtService.generateToken(user);
            return ResponseEntity.ok(new WrapperResponse(HttpStatus.OK.value(), newAccessToken));
        } else {
            throw new BaseError(HttpStatus.FORBIDDEN.value(), "YOU DON'T HAVE PERMISSION");
        }
    }
    @GetMapping("/verify")
    public ResponseEntity<WrapperResponse> verifyAccount(@RequestParam("token") String token) {
        VerificationToken verificationToken = verificationTokenService.findByToken(token);

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BaseError(HttpStatus.GONE.value(), "Your validate token expired");
        }

        User user = verificationToken.getUser();
        user.setStatus(UserStatus.ACTIVE);
        userService.save(user);

        verificationTokenService.delete(verificationToken);

        return ResponseEntity.ok(new WrapperResponse(HttpStatus.OK.value(), "Your account is verified"));
    }

}
