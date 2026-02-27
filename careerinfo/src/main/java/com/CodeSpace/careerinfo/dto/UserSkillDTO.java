package com.CodeSpace.careerinfo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserSkillDTO {
    @NotNull
    private Long id;
    @NotNull
    private Long skillId;
    @NotBlank
    private String skillName;
    @NotBlank
    private String proficiencyLevel;
}


