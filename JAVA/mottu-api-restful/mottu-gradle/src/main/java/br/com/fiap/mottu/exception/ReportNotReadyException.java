package br.com.fiap.mottu.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.ACCEPTED)
public class ReportNotReadyException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public ReportNotReadyException(String message) {
        super(message);
    }
}


