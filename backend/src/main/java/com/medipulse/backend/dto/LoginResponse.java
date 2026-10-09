package com.medipulse.backend.dto;
import com.medipulse.backend.entity.User;
public class LoginResponse {
    private String token;
    private String refreshToken;
    private UserResponse user;
    public LoginResponse(String token,String refreshToken,User user){this.token=token;this.refreshToken=refreshToken;this.user=new UserResponse(user);}
    public String getToken(){return token;}
    public String getRefreshToken(){return refreshToken;}
    public UserResponse getUser(){return user;}
}
