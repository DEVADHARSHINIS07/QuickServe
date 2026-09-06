package com.smartcanteen.exception;

public class CustomExceptions {

    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) { super(message); }
    }

    public static class UserAlreadyExistsException extends RuntimeException {
        public UserAlreadyExistsException(String message) { super(message); }
    }

    public static class InvalidCredentialsException extends RuntimeException {
        public InvalidCredentialsException(String message) { super(message); }
    }

    public static class InvalidDomainException extends RuntimeException {
        public InvalidDomainException(String message) { super(message); }
    }

    public static class PasswordMismatchException extends RuntimeException {
        public PasswordMismatchException(String message) { super(message); }
    }

    public static class OutOfStockException extends RuntimeException {
        public OutOfStockException(String message) { super(message); }
    }
}
