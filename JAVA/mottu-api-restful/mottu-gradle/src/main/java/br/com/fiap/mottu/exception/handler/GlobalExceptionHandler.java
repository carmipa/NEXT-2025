// Caminho do arquivo: br\com\fiap\mottu\exception\handler\GlobalExceptionHandler.java
package br.com.fiap.mottu.exception.handler;

import br.com.fiap.mottu.exception.DuplicatedResourceException;
import br.com.fiap.mottu.exception.InvalidInputException;
import br.com.fiap.mottu.exception.ResourceNotFoundException;
import br.com.fiap.mottu.exception.ResourceInUseException;
import br.com.fiap.mottu.exception.OperationNotAllowedException;
import br.com.fiap.mottu.exception.ReportNotReadyException;
import br.com.fiap.mottu.exception.DateRangeTooLargeException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.hibernate.HibernateException;

import jakarta.validation.ConstraintViolationException;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "Não Encontrado");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false));
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DuplicatedResourceException.class)
    public ResponseEntity<Object> handleDuplicatedResourceException(DuplicatedResourceException ex, WebRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.CONFLICT.value());
        body.put("error", "Conflito de Dados");
        
        String message = ex.getMessage();
        
        // Melhorar mensagem específica para boxes duplicados
        if (message != null && (message.contains("Box") || message.contains("box"))) {
            body.put("message", message);
            body.put("errorType", "DUPLICATED_BOX");
            body.put("suggestion", "Verifique se há boxes antigos com os mesmos nomes. Você pode precisar removê-los antes de criar novos boxes com os mesmos nomes.");
        } else {
            body.put("message", message);
            body.put("errorType", "DUPLICATED_RESOURCE");
        }
        
        body.put("path", request.getDescription(false));
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(InvalidInputException.class)
    public ResponseEntity<Object> handleInvalidInputException(InvalidInputException ex, WebRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Requisição Inválida");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false));
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DateRangeTooLargeException.class)
    public ResponseEntity<Object> handleDateRangeTooLargeException(DateRangeTooLargeException ex, WebRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Período muito grande");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false));
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ReportNotReadyException.class)
    public ResponseEntity<Object> handleReportNotReadyException(ReportNotReadyException ex, WebRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.ACCEPTED.value());
        body.put("error", "Relatório ainda não pronto");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false));
        return new ResponseEntity<>(body, HttpStatus.ACCEPTED);
    }

    @ExceptionHandler(ResourceInUseException.class)
    public ResponseEntity<Object> handleResourceInUseException(ResourceInUseException ex, WebRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.CONFLICT.value());
        body.put("error", "Recurso em Uso");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false));
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(OperationNotAllowedException.class)
    public ResponseEntity<Object> handleOperationNotAllowedException(OperationNotAllowedException ex, WebRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.FORBIDDEN.value());
        body.put("error", "Operação Não Permitida");
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false));
        return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidationExceptions(MethodArgumentNotValidException ex, WebRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Dados Inválidos");
        body.put("message", "Por favor, corrija os seguintes erros:");
        
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });
        
        body.put("validationErrors", errors);
        body.put("path", request.getDescription(false));
        
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // Handler para erros de violação de integridade de dados (duplicação, FK, etc.)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Object> handleDataIntegrityViolationException(DataIntegrityViolationException ex, WebRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.CONFLICT.value());
        body.put("error", "Violação de Integridade de Dados");
        
        String message = ex.getMessage();
        String path = request.getDescription(false);
        
        // Verificar se é uma tentativa de exclusão (DELETE)
        boolean isDeleteOperation = path != null && path.contains("DELETE");
        
        if (message != null) {
        if (message.contains("duplicate") || message.contains("UNIQUE")) {
            body.put("message", "Já existe um registro com estes dados. Verifique se não há duplicação.");
                body.put("errorType", "DUPLICATE_KEY_ERROR");
            } else if (message.contains("foreign key") || message.contains("FK") || message.contains("restrição de integridade")) {
                // Mensagem específica para exclusão de pátio
                if (isDeleteOperation && (message.contains("TB_BOX") || message.contains("TB_PATIO") || message.contains("FKT2792U9BUPWALT19XUKKBESXM"))) {
                    body.put("error", "Não é possível excluir o Pátio");
                    body.put("message", "Não é possível excluir este Pátio pois ele possui dependências que não puderam ser removidas automaticamente. " +
                            "O pátio pode ter boxes com notificações, logs de movimentação ou outras dependências ativas. " +
                            "Por favor, verifique manualmente ou entre em contato com o suporte.");
                    body.put("errorType", "PATIO_DELETE_CONSTRAINT_ERROR");
                    body.put("suggestion", "Verifique se há notificações, logs ou outras dependências relacionadas aos boxes do pátio.");
                } else {
                    body.put("message", "Não é possível excluir/alterar este registro pois está sendo referenciado por outros dados.");
                    body.put("errorType", "FOREIGN_KEY_CONSTRAINT_ERROR");
                }
            } else {
                body.put("message", "Violação de integridade de dados: " + message);
                body.put("errorType", "DATA_INTEGRITY_ERROR");
            }
        } else {
            body.put("message", "Não é possível excluir/alterar este registro pois está sendo referenciado por outros dados.");
            body.put("errorType", "DATA_INTEGRITY_ERROR");
        }
        
        body.put("path", path);
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    // Handler para erros de SQL
    @ExceptionHandler(SQLException.class)
    public ResponseEntity<Object> handleSQLException(SQLException ex, WebRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "Erro de Banco de Dados");
        body.put("message", "Erro interno do banco de dados. Tente novamente mais tarde.");
        body.put("path", request.getDescription(false));
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Handler específico para erros do Hibernate/JPA relacionados a coleções com orphanRemoval
    @ExceptionHandler(JpaSystemException.class)
    public ResponseEntity<Object> handleJpaSystemException(JpaSystemException ex, WebRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "Erro de Persistência de Dados");
        
        String message = ex.getMessage();
        Throwable cause = ex.getCause();
        
        // Detectar erro específico de coleção com orphanRemoval
        if (cause instanceof HibernateException && 
            (message != null && message.contains("delete-orphan") || 
             (cause.getMessage() != null && cause.getMessage().contains("delete-orphan")))) {
            
            body.put("error", "Erro ao Atualizar Relacionamentos");
            body.put("message", "Erro ao processar relacionamentos de dados. O veículo pode já estar estacionado ou o box pode estar ocupado. " +
                    "Tente verificar se a moto já está estacionada ou escolha outro box.");
            body.put("errorType", "COLLECTION_ORPHAN_REMOVAL_ERROR");
            body.put("suggestion", "Verifique se o veículo já está estacionado ou se o box selecionado está disponível.");
            
        } else if (message != null && message.contains("LazyInitializationException")) {
            body.put("error", "Erro de Inicialização de Dados");
            body.put("message", "Erro ao carregar dados relacionados. Tente novamente.");
            body.put("errorType", "LAZY_INITIALIZATION_ERROR");
            
        } else {
            body.put("message", "Erro interno ao processar dados. Tente novamente mais tarde.");
            body.put("errorType", "JPA_SYSTEM_ERROR");
        }
        
        body.put("path", request.getDescription(false));
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Handler para erros genéricos do Hibernate
    @ExceptionHandler(HibernateException.class)
    public ResponseEntity<Object> handleHibernateException(HibernateException ex, WebRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "Erro de Persistência de Dados");
        
        String message = ex.getMessage();
        
        if (message != null && message.contains("delete-orphan")) {
            body.put("error", "Erro ao Atualizar Relacionamentos");
            body.put("message", "Erro ao processar relacionamentos de dados. Verifique se o veículo já está estacionado ou se o box está disponível.");
            body.put("errorType", "COLLECTION_ORPHAN_REMOVAL_ERROR");
            body.put("suggestion", "Verifique se o veículo já está estacionado ou se o box selecionado está disponível.");
        } else {
            body.put("message", "Erro interno ao processar dados. Tente novamente mais tarde.");
            body.put("errorType", "HIBERNATE_ERROR");
        }
        
        body.put("path", request.getDescription(false));
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Handler para JSON malformado
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Object> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex, WebRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "JSON Inválido");
        body.put("message", "O JSON enviado está malformado. Verifique a sintaxe e tente novamente.");
        body.put("path", request.getDescription(false));
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // Handler para violações de constraints de validação
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Object> handleConstraintViolationException(ConstraintViolationException ex, WebRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Violação de Constraints");
        body.put("message", "Dados inválidos fornecidos:");
        
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getConstraintViolations().forEach(violation -> {
            String fieldName = violation.getPropertyPath().toString();
            errors.put(fieldName, violation.getMessage());
        });
        
        body.put("validationErrors", errors);
        body.put("path", request.getDescription(false));
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // Handler genérico para todas as outras exceções
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGenericException(Exception ex, WebRequest request) {
        // Se for pedido SSE, não tente serializar Map como text/event-stream
        if (isSseRequest(request)) {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_EVENT_STREAM);
            String payload = "event: error\n" +
                    "data: {\"status\":500,\"message\":\"Erro no stream\"}\n\n";
            return new ResponseEntity<>(payload, headers, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "Erro Interno do Servidor");
        
        // Melhorar mensagem baseada no tipo de exceção
        String exMessage = ex.getMessage();
        if (exMessage != null) {
            if (exMessage.contains("delete-orphan") || exMessage.contains("collection")) {
                body.put("error", "Erro ao Atualizar Relacionamentos");
                body.put("message", "Erro ao processar relacionamentos de dados. Verifique se o veículo já está estacionado ou se o box está disponível.");
                body.put("errorType", "COLLECTION_ORPHAN_REMOVAL_ERROR");
            } else if (exMessage.contains("LazyInitializationException")) {
                body.put("error", "Erro de Inicialização de Dados");
                body.put("message", "Erro ao carregar dados relacionados. Tente novamente.");
                body.put("errorType", "LAZY_INITIALIZATION_ERROR");
            } else {
                body.put("message", "Ocorreu um erro inesperado. Tente novamente mais tarde.");
                body.put("errorType", "UNKNOWN_ERROR");
            }
        } else {
            body.put("message", "Ocorreu um erro inesperado. Tente novamente mais tarde.");
            body.put("errorType", "UNKNOWN_ERROR");
        }
        
        body.put("path", request.getDescription(false));
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private boolean isSseRequest(WebRequest request) {
        if (request instanceof ServletWebRequest servlet) {
            String accept = servlet.getRequest().getHeader("Accept");
            String ct = servlet.getRequest().getHeader("Content-Type");
            return (accept != null && accept.contains("text/event-stream")) ||
                   (ct != null && ct.contains("text/event-stream"));
        }
        return false;
    }
}