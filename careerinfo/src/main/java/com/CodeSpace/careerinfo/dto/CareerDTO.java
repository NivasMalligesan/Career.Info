package com.CodeSpace.careerinfo.dto;

import lombok.Data;

import java.util.List;

@Data
public class CareerDTO {
    private Long id;
    private String careerName;
    private String description;
    private Integer demandLevel;
    private Double averageSalary;
    private List<CareerSkillDTO> requiredSkills;
}

