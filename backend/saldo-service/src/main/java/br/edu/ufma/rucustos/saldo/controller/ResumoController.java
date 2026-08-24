package br.edu.ufma.rucustos.saldo.controller;

import br.edu.ufma.rucustos.saldo.dto.SaldoResumoResponse;
import br.edu.ufma.rucustos.saldo.service.ResumoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/saldo")
public class ResumoController {

    private final ResumoService resumoService;

    public ResumoController(ResumoService resumoService) {
        this.resumoService = resumoService;
    }

    @GetMapping("/resumo")
    public SaldoResumoResponse resumo(@RequestHeader("Authorization") String authorization) {
        return resumoService.montarResumo(authorization);
    }
}
