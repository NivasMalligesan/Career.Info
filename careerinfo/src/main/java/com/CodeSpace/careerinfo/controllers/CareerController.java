package com.CodeSpace.careerinfo.controllers;

import com.CodeSpace.careerinfo.dto.CareerDTO;
import com.CodeSpace.careerinfo.service.CareerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/career")
public class CareerController {

    private final CareerService careerService;

    @PostMapping
    public ResponseEntity<CareerDTO> createCareer(@RequestBody CareerDTO careerDTO) {
        CareerDTO createdCareer = careerService.createCareer(careerDTO);
        return new ResponseEntity<>(createdCareer, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CareerDTO>> getAllCareers() {
        List<CareerDTO> careers = careerService.getAllCareers();
        return new ResponseEntity<>(careers, HttpStatus.OK);
    }

    @GetMapping("/{careerId}")
    public ResponseEntity<CareerDTO> getCareerById(@PathVariable Long careerId) {
        CareerDTO career = careerService.getCareerById(careerId);
        return new ResponseEntity<>(career, HttpStatus.OK);
    }

    @PutMapping("/{careerId}")
    public ResponseEntity<CareerDTO> updateCareer(@PathVariable Long careerId, @RequestBody CareerDTO careerDTO) {
        CareerDTO updatedCareer = careerService.updateCareer(careerId, careerDTO);
        return new ResponseEntity<>(updatedCareer, HttpStatus.OK);
    }

    @DeleteMapping("/{careerId}")
    public ResponseEntity<String> deleteCareer(@PathVariable Long careerId) {
        careerService.deleteCareer(careerId);
        return new ResponseEntity<>("Career deleted successfully", HttpStatus.OK);
    }
}