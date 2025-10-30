// main\java\br\com\fiap\mottu\model\relacionamento\ClienteVeiculo.java
package br.com.fiap.mottu.model.relacionamento;

import br.com.fiap.mottu.model.Cliente;
import br.com.fiap.mottu.model.Veiculo;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TB_CLIENTEVEICULO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString // CORRIGIDO: Removido o parâmetro 'exclude'
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ClienteVeiculo {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private ClienteVeiculoId id;
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("clienteId")
    @JoinColumn(name = "TB_CLIENTE_ID_CLIENTE", referencedColumnName = "ID_CLIENTE", nullable = false, insertable = false, updatable = false)
    @ToString.Exclude // MANTER esta anotação no campo
    private Cliente cliente;
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("veiculoId")
    @JoinColumn(name = "TB_VEICULO_ID_VEICULO", referencedColumnName = "ID_VEICULO", nullable = false, insertable = false, updatable = false)
    @ToString.Exclude // MANTER esta anotação no campo
    private Veiculo veiculo;

    public ClienteVeiculo(Cliente cliente, Veiculo veiculo) {
        this.cliente = cliente;
        this.veiculo = veiculo;
        this.id = new ClienteVeiculoId(
                cliente.getIdCliente(),
                cliente.getEndereco() != null ? cliente.getEndereco().getIdEndereco() : null,
                cliente.getContato() != null ? cliente.getContato().getIdContato() : null,
                veiculo.getIdVeiculo()
        );
    }
}