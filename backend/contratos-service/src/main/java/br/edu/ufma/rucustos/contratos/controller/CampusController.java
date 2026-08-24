package br.edu.ufma.rucustos.contratos.controller;

import br.edu.ufma.rucustos.contratos.model.Campus;
import br.edu.ufma.rucustos.contratos.repository.CampusRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/contratos/campus")
public class CampusController {

    private final CampusRepository campusRepository;

    public CampusController(CampusRepository campusRepository) {
        this.campusRepository = campusRepository;
    }

    @GetMapping
    public List<Campus> listar() {
        return campusRepository.findAll();
    }

    @GetMapping("/{id}")
    public Campus buscarPorId(@PathVariable Long id) {
        return campusRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "campus não encontrado"));
    }

    @PostMapping
    public Campus criar(@Valid @RequestBody Campus campus) {
        if (campusRepository.existsByNome(campus.getNome())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "já existe um campus com esse nome");
        }
        campus.setId(null);
        return campusRepository.save(campus);
    }

    @PutMapping("/{id}")
    public Campus atualizar(@PathVariable Long id, @Valid @RequestBody Campus dadosAtualizados) {
        Campus campus = campusRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "campus não encontrado"));
        campus.setNome(dadosAtualizados.getNome());
        return campusRepository.save(campus);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        if (!campusRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "campus não encontrado");
        }
        campusRepository.deleteById(id);
    }
}
