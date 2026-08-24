package br.edu.ufma.rucustos.previsoes.repository;

import br.edu.ufma.rucustos.previsoes.model.ContratoPrevisao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContratoPrevisaoRepository extends JpaRepository<ContratoPrevisao, Long> {
}
