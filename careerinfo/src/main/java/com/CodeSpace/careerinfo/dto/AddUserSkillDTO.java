package com.CodeSpace.careerinfo.dto;

import lombok.Data;

@Data
public class AddUserSkillDTO {
    private Long skillId;
    private String proficiencyLevel; // BEGINNER / INTERMEDIATE / ADVANCED
}
