package webtech.online.course.services;

import webtech.online.course.dtos.RegisterRequest;
import webtech.online.course.models.User;
import webtech.online.course.dtos.OAuth2UserInfo;
import webtech.online.course.models.VerificationToken;

public interface UserService {
    public User registerUser(RegisterRequest request);
    public User firstOAuth(OAuth2UserInfo oAuth2UserInfo, String roleName, String providerId);
    public VerificationToken createVerificationToken(User user);
    public User save(User user);
    public User findById(Long id);
    public User confirmOriginalLogin(String email, String role);
    public User findByEmail(String email);
}
