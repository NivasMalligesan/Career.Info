package com.CodeSpace.careerinfo.dto;

import lombok.Data;

@Data
public class SkillGapDTO {
    private Long skillId;
    private String skillName;
    private String requiredLevel;
    private String userLevel;
    private boolean matched;
}