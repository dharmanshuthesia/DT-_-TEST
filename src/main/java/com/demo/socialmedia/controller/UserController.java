package com.demo.socialmedia.controller;

import com.demo.socialmedia.service.UserService;
import com.demo.socialmedia.model.Request.LoginRequest;
import com.demo.socialmedia.model.Request.PasswordRequest;
import com.demo.socialmedia.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Exposes the public authentication endpoints: account registration, login (JWT issuance),
 * and password reset. Delegates all business logic to {@link UserService}.
 */
// REST controller for authentication and account management; all routes are prefixed with /auth/users
@RestController
@RequestMapping(path = "/auth/users")
public class UserController {
    // Business-logic layer that performs registration, login, and password reset
    private UserService userService;

    // Setter-based injection so the service can be swapped/mocked in tests
    @Autowired
    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    // Registers a new account; request body is deserialized into a User and the persisted entity is returned
    //http://localhost:portnumber/auth/users/register
    @PostMapping("/register")
    public User createUser(@RequestBody User userObject) {
        System.out.println("calling createUser");
        return userService.createUser(userObject);
    }

    // Authenticates credentials; service returns a ResponseEntity carrying the JWT on success or an error status
    //http://localhost:9092/auth/users/login
    @PostMapping("/login")
    public ResponseEntity<Object> loginUser(@RequestBody LoginRequest loginRequest) {
        System.out.println("calling loginUser");
        return userService.loginUser(loginRequest);
    }

    // Updates the password for the account identified in the request payload
    @PutMapping("/passwordreset")
    public ResponseEntity<?> passwordReset(@RequestBody PasswordRequest passwordRequest)
    {
        System.out.println("calling passwordReset");
        //need to refactor to run method to change password.
        return userService.passwordReset(passwordRequest);
    }
}


