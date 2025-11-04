package br.com.fiap.mottu.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Anotação customizada para validar idade mínima a partir da data de nascimento.
 * Valida se a pessoa tem pelo menos a idade especificada (padrão: 18 anos).
 */
@Documented
@Constraint(validatedBy = IdadeMinimaValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface IdadeMinima {
    String message() default "A pessoa deve ter pelo menos {idade} anos de idade.";
    
    int idade() default 18;
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
}

