package com.CodeSpace.careerinfo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SkillDTO {
    @NotNull
    private Long id;
    @NotBlank
    private String skillName;
    @NotBlank
    private String category;
    @NotBlank
    private String description;
}
