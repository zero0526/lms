package webtech.online.course.services.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import webtech.online.course.dtos.OAuth2UserInfo;
import webtech.online.course.dtos.RegisterRequest;
import webtech.online.course.enums.AuthProvider;
import webtech.online.course.enums.UserStatus;
import webtech.online.course.models.Role;
import webtech.online.course.models.User;
import webtech.online.course.models.VerificationToken;
import webtech.online.course.repositories.UserRepository;
import webtech.online.course.repositories.VerificationTokenRepository;
import webtech.online.course.services.UserService;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final RoleServiceImpl roleService;
    private final PasswordEncoder passwordEncoder;
    private final VerificationTokenRepository verificationTokenRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository,  RoleServiceImpl roleService, PasswordEncoder passwordEncoder, VerificationTokenRepository verificationTokenRepository){
        this.userRepository= userRepository;
        this.roleService= roleService;
        this.passwordEncoder= passwordEncoder;
        this.verificationTokenRepository= verificationTokenRepository;
    }

    @Override
    public User registerUser(RegisterRequest request) {
        if(userRepository.findByEmail(request.getEmail()).isPresent()){
            throw new RuntimeException("Email has already existed");
        }

        Role role= roleService.findOrCreateRole(request.getRoleName());
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        User user= User.builder()
                .email(request.getEmail())
                .passwordHash(hashedPassword)
                .fullName(request.getFullName())
                .role(role)
                .status(UserStatus.LOCKED)
                .build();
        return userRepository.save(user);
    }

    @Override
    public User firstOAuth(OAuth2UserInfo oAuth2UserInfo, String roleName, String providerId) {
        if(userRepository.findByEmail(oAuth2UserInfo.getEmail()).isPresent()){
            throw new RuntimeException("Email has already existed");
        }

        Role role= roleService.findOrCreateRole(roleName);
        AuthProvider authProvider = switch (providerId.toLowerCase()) {
            case "google" -> AuthProvider.GOOGLE;
            case "github" -> AuthProvider.GITHUB;
            case "facebook" -> AuthProvider.FACEBOOK;
            default -> AuthProvider.LOCAL;
        };

        User user= User.builder()
                .email(oAuth2UserInfo.getEmail())
                .fullName(oAuth2UserInfo.getName())
                .pictureUrl(oAuth2UserInfo.getImageUrl())
                .role(role)
                .providerUserId(oAuth2UserInfo.getUserProviderId())
                .authProvider(authProvider)
                .build();
        return userRepository.save(user);
    }

    @Override
    public VerificationToken createVerificationToken(User user) {
        String token = UUID.randomUUID().toString();

        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24));

        verificationTokenRepository.save(verificationToken);
        return verificationToken;
    }

    @Override
    public User save(User user) {
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email){
        return userRepository.findByEmail(email);
    }
}
