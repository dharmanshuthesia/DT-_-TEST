package com.demo.socialmedia.exception;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a client tries to create a resource that already exists
 * (e.g. registering a duplicate username or posting a duplicate title).
 * The @ResponseStatus annotation makes Spring MVC translate this into an
 * HTTP 409 CONFLICT response automatically.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class InformationExistException extends RuntimeException{
    public InformationExistException(String message){
        super(message);
    }
}
