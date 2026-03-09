package com.CodeSpace.careerinfo.dto;

import lombok.Data;

@Data
public class CareerSkillDTO {
    private Long skillId;
    private String skillName;
    private String requiredLevel; // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
}