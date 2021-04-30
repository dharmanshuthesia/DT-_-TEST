package com.demo.socialmedia.model.Request;

public class PasswordRequest {
    private String email;
    private String oldPassword;
    private String newPassword;

    public String getEmail() {
        return email;
    }

    public String getOldPassword() {
        return oldPassword;
    }


    public String getNewPassword() {
        return newPassword;
    }
}
