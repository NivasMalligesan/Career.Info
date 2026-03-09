package com.CodeSpace.careerinfo.dto;

import lombok.Data;
import java.util.List;

@Data
public class SkillGapAnalysisDTO {
    private Long careerId;
    private String careerName;
    private Double matchPercentage;
    private List<SkillGapDTO> skillGaps;
}