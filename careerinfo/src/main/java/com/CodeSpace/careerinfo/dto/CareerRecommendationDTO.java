package com.CodeSpace.careerinfo.dto;

import lombok.Data;
import java.util.List;

@Data
public class CareerRecommendationDTO {
    private Long careerId;
    private String careerName;
    private String description;
    private double matchPercentage;
    private Integer demandLevel;
    private Double averageSalary;
    private List<SkillGapDTO> skillGaps;
}