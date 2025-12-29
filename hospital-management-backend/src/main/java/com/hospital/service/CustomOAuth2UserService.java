package com.hospital.service;

import com.hospital.config.FacebookOAuth2UserInfo;
import com.hospital.config.GitHubOAuth2UserInfo;
import com.hospital.config.GoogleOAuth2UserInfo;
import com.hospital.config.OAuth2UserInfo;
import com.hospital.model.User;
import com.hospital.repository.mysql.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        // Extract provider name (google, facebook, github)
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo userInfo = getOAuth2UserInfo(registrationId, oauth2User.getAttributes());

        if (userInfo.getEmail() == null || userInfo.getEmail().isEmpty()) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        // Find or create user
        User user = processOAuth2User(userInfo, registrationId);

        // Return OAuth2 user with our custom User object as principal
        return new CustomOAuth2User(oauth2User, user);
    }

    private OAuth2UserInfo getOAuth2UserInfo(String registrationId, java.util.Map<String, Object> attributes) {
        switch (registrationId.toLowerCase()) {
            case "google":
                return new GoogleOAuth2UserInfo(attributes);
            case "facebook":
                return new FacebookOAuth2UserInfo(attributes);
            case "github":
                return new GitHubOAuth2UserInfo(attributes);
            default:
                throw new OAuth2AuthenticationException("Unsupported OAuth2 provider: " + registrationId);
        }
    }

    private User processOAuth2User(OAuth2UserInfo userInfo, String provider) {
        // Check if user exists by email
        Optional<User> userOptional = userRepository.findByEmail(userInfo.getEmail());

        User user;
        if (userOptional.isPresent()) {
            // Update existing user
            user = userOptional.get();
            if (!user.getProvider().equalsIgnoreCase(provider)) {
                // User registered with different provider or locally
                // Allow linking accounts by updating provider
                user.setProvider(provider);
            }
            user.setProviderId(userInfo.getId());
            user.setProfilePictureUrl(userInfo.getImageUrl());
            user.setFullName(userInfo.getName());
        } else {
            // Create new user
            user = new User();
            user.setEmail(userInfo.getEmail());
            user.setFullName(userInfo.getName());
            user.setProvider(provider.toUpperCase());
            user.setProviderId(userInfo.getId());
            user.setProfilePictureUrl(userInfo.getImageUrl());
            user.setRole("PATIENT"); // Default role for new OAuth2 users
            user.setIsActive(true);
            // Generate unique username from email
            user.setUsername(generateUsernameFromEmail(userInfo.getEmail()));
            user.setPassword(null); // OAuth2 users don't have passwords
        }

        return userRepository.save(user);
    }

    private String generateUsernameFromEmail(String email) {
        String baseUsername = email.split("@")[0];
        String username = baseUsername;
        int counter = 1;

        // Check for uniqueness and append number if needed
        while (userRepository.findByUsername(username).isPresent()) {
            username = baseUsername + counter;
            counter++;
        }

        return username;
    }

    // Custom OAuth2User wrapper to include our User object
    private static class CustomOAuth2User implements OAuth2User {
        private final OAuth2User oauth2User;
        private final User user;

        public CustomOAuth2User(OAuth2User oauth2User, User user) {
            this.oauth2User = oauth2User;
            this.user = user;
        }

        @Override
        public java.util.Map<String, Object> getAttributes() {
            return oauth2User.getAttributes();
        }

        @Override
        public java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> getAuthorities() {
            return oauth2User.getAuthorities();
        }

        @Override
        public String getName() {
            return oauth2User.getName();
        }

        public User getUser() {
            return user;
        }
    }
}
