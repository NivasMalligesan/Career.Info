package com.CodeSpace.careerinfo.controllers;

import com.CodeSpace.careerinfo.dto.CareerRecommendationDTO;
import com.CodeSpace.careerinfo.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/recommendations/{userId}")
    public ResponseEntity<List<CareerRecommendationDTO>> getRecommendations(@PathVariable Long userId) {
        List<CareerRecommendationDTO> recommendations = recommendationService.getRecommendations(userId);
        return new ResponseEntity<>(recommendations, HttpStatus.OK);
    }

    @GetMapping("/analysis/{userId}/career/{careerId}")
    public ResponseEntity<CareerRecommendationDTO> getCareerAnalysis(
            @PathVariable Long userId,
            @PathVariable Long careerId) {
        CareerRecommendationDTO analysis = recommendationService.getCareerAnalysis(userId, careerId);
        return new ResponseEntity<>(analysis, HttpStatus.OK);
    }
}