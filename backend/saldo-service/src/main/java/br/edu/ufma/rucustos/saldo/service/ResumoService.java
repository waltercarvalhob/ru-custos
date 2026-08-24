package br.edu.ufma.rucustos.saldo.service;

import br.edu.ufma.rucustos.saldo.dto.ContratosResumoDto;
import br.edu.ufma.rucustos.saldo.dto.PrevisoesResumoDto;
import br.edu.ufma.rucustos.saldo.dto.SaldoResumoResponse;
import br.edu.ufma.rucustos.saldo.dto.SiopResumoDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class ResumoService {

    private final RestClient.Builder restClientBuilder;
    private final String contratosUrl;
    private final String previsoesUrl;
    private final String siopUrl;

    public ResumoService(
            RestClient.Builder restClientBuilder,
            @Value("${ru-custos.servicos.contratos-url}") String contratosUrl,
            @Value("${ru-custos.servicos.previsoes-url}") String previsoesUrl,
            @Value("${ru-custos.servicos.siop-url}") String siopUrl) {
        this.restClientBuilder = restClientBuilder;
        this.contratosUrl = contratosUrl;
        this.previsoesUrl = previsoesUrl;
        this.siopUrl = siopUrl;
    }

    public SaldoResumoResponse montarResumo(String authorizationHeader) {
        RestClient client = restClientBuilder.build();

        ContratosResumoDto contratos = client.get()
                .uri(contratosUrl + "/api/contratos/resumo")
                .header("Authorization", authorizationHeader)
                .retrieve()
                .body(ContratosResumoDto.class);

        PrevisoesResumoDto previsoes = client.get()
                .uri(previsoesUrl + "/api/previsoes/resumo")
                .header("Authorization", authorizationHeader)
                .retrieve()
                .body(PrevisoesResumoDto.class);

        SiopResumoDto siop = client.get()
                .uri(siopUrl + "/api/siop/resumo")
                .header("Authorization", authorizationHeader)
                .retrieve()
                .body(SiopResumoDto.class);

        return SaldoResumoResponse.montar(contratos, previsoes, siop);
    }
}
