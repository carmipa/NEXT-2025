package br.com.fiap.mottu.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.LocalDate;
import java.time.Period;

/**
 * Validador customizado para verificar se a pessoa tem idade mínima a partir da data de nascimento.
 */
public class IdadeMinimaValidator implements ConstraintValidator<IdadeMinima, LocalDate> {
    
    private int idadeMinima;
    
    @Override
    public void initialize(IdadeMinima constraintAnnotation) {
        this.idadeMinima = constraintAnnotation.idade();
    }
    
    @Override
    public boolean isValid(LocalDate dataNascimento, ConstraintValidatorContext context) {
        if (dataNascimento == null) {
            // Se a data for nula, deixar outras validações (como @NotNull) tratarem isso
            return true;
        }
        
        // Sempre usar a data atual para cálculo
        LocalDate hoje = LocalDate.now();
        
        // Calcular idade usando Period para precisão
        Period periodo = Period.between(dataNascimento, hoje);
        int idade = periodo.getYears();
        
        // Verifica se a pessoa já completou o aniversário este ano
        // Se ainda não chegou o aniversário, a idade é menor
        if (hoje.getMonthValue() < dataNascimento.getMonthValue() || 
            (hoje.getMonthValue() == dataNascimento.getMonthValue() && 
             hoje.getDayOfMonth() < dataNascimento.getDayOfMonth())) {
            idade--;
        }
        
        // Valida se a idade é menor que o mínimo exigido
        if (idade < idadeMinima) {
            // Personaliza a mensagem de erro com informação clara
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                String.format("A pessoa deve ter pelo menos %d anos de idade. Data de nascimento informada (%s) resulta em idade de %d anos (data atual: %s).", 
                    idadeMinima, 
                    dataNascimento.toString(), 
                    idade, 
                    hoje.toString())
            ).addConstraintViolation();
            return false;
        }
        
        return true;
    }
}

