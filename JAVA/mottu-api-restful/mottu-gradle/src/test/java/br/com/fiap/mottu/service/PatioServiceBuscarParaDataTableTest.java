package br.com.fiap.mottu.service;

import br.com.fiap.mottu.dto.datatable.DataTableRequest;
import br.com.fiap.mottu.dto.datatable.DataTableResponse;
import br.com.fiap.mottu.dto.patio.PatioResponseDto;
import br.com.fiap.mottu.filter.PatioFilter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes para validar correção do PatioFilter no método buscarParaDataTable
 */
@SpringBootTest
@Transactional
@Rollback
@DisplayName("Testes - PatioService.buscarParaDataTable com PatioFilter")
class PatioServiceBuscarParaDataTableTest {

    @Autowired
    private PatioService patioService;

    @Test
    @DisplayName("✅ Deve buscar pátios para DataTable com filtro null (deve criar filtro vazio)")
    void deveBuscarParaDataTableComFiltroNull() {
        // Arrange
        DataTableRequest request = DataTableRequest.builder()
                .draw(1)
                .start(0)
                .length(10)
                .build();

        // Act - Passa null como filtro
        assertDoesNotThrow(() -> {
            DataTableResponse<PatioResponseDto> response = patioService.buscarParaDataTable(request, null);

            // Assert
            assertNotNull(response);
            assertNotNull(response.getData());
            assertEquals(1, response.getDraw());
            assertNotNull(response.getRecordsTotal());
            assertNotNull(response.getRecordsFiltered());
        });
    }

    @Test
    @DisplayName("✅ Deve buscar pátios para DataTable com filtro vazio")
    void deveBuscarParaDataTableComFiltroVazio() {
        // Arrange
        DataTableRequest request = DataTableRequest.builder()
                .draw(1)
                .start(0)
                .length(10)
                .build();

        PatioFilter filtroVazio = new PatioFilter(null, null, null, null, null, null, null, null, null);

        // Act
        assertDoesNotThrow(() -> {
            DataTableResponse<PatioResponseDto> response = patioService.buscarParaDataTable(request, filtroVazio);

            // Assert
            assertNotNull(response);
            assertNotNull(response.getData());
            assertEquals(1, response.getDraw());
        });
    }

    @Test
    @DisplayName("✅ Deve buscar pátios para DataTable com filtro preenchido")
    void deveBuscarParaDataTableComFiltroPreenchido() {
        // Arrange
        DataTableRequest request = DataTableRequest.builder()
                .draw(1)
                .start(0)
                .length(10)
                .build();

        PatioFilter filtro = new PatioFilter("Teste", null, null, null, null, null, null, null, null);

        // Act
        assertDoesNotThrow(() -> {
            DataTableResponse<PatioResponseDto> response = patioService.buscarParaDataTable(request, filtro);

            // Assert
            assertNotNull(response);
            assertNotNull(response.getData());
            assertEquals(1, response.getDraw());
        });
    }

    @Test
    @DisplayName("✅ Deve buscar pátios para DataTable com busca global")
    void deveBuscarParaDataTableComBuscaGlobal() {
        // Arrange
        DataTableRequest request = DataTableRequest.builder()
                .draw(1)
                .start(0)
                .length(10)
                .searchValue("Teste")
                .build();

        // Act - Passa null como filtro, mas com searchValue no request
        assertDoesNotThrow(() -> {
            DataTableResponse<PatioResponseDto> response = patioService.buscarParaDataTable(request, null);

            // Assert
            assertNotNull(response);
            assertNotNull(response.getData());
            assertEquals(1, response.getDraw());
        });
    }

    @Test
    @DisplayName("✅ Deve buscar pátios para DataTable com ordenação")
    void deveBuscarParaDataTableComOrdenacao() {
        // Arrange
        DataTableRequest request = DataTableRequest.builder()
                .draw(1)
                .start(0)
                .length(10)
                .orderColumn(1) // nomePatio
                .orderDirection("asc")
                .build();

        // Act
        assertDoesNotThrow(() -> {
            DataTableResponse<PatioResponseDto> response = patioService.buscarParaDataTable(request, null);

            // Assert
            assertNotNull(response);
            assertNotNull(response.getData());
            assertEquals(1, response.getDraw());
        });
    }

    @Test
    @DisplayName("✅ Deve retornar erro apropriado quando houver exceção")
    void deveRetornarErroApropriado() {
        // Arrange - Request inválido (length = 0 causa divisão por zero)
        DataTableRequest request = DataTableRequest.builder()
                .draw(1)
                .start(0)
                .length(0) // Inválido
                .build();

        // Act
        DataTableResponse<PatioResponseDto> response = patioService.buscarParaDataTable(request, null);

        // Assert - Deve retornar resposta de erro
        assertNotNull(response);
        assertNotNull(response.getError()); // Deve ter mensagem de erro
    }
}

