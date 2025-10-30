package br.com.fiap.mottu.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class DateRangeTooLargeException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public DateRangeTooLargeException(String message) {
        super(message);
    }
}


