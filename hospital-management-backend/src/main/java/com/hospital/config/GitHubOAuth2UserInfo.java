package com.hospital.config;

import java.util.Map;

public class GitHubOAuth2UserInfo implements OAuth2UserInfo {
    private Map<String, Object> attributes;

    public GitHubOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public String getId() {
        Integer id = (Integer) attributes.get("id");
        return id != null ? id.toString() : null;
    }

    @Override
    public String getName() {
        String name = (String) attributes.get("name");
        if (name == null || name.isEmpty()) {
            return (String) attributes.get("login"); // Fallback to login username
        }
        return name;
    }

    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }

    @Override
    public String getImageUrl() {
        return (String) attributes.get("avatar_url");
    }
}
