package com.CodeSpace.careerinfo.service;

import com.CodeSpace.careerinfo.dto.CareerRecommendationDTO;
import com.CodeSpace.careerinfo.dto.SkillGapDTO;
import com.CodeSpace.careerinfo.model.*;
import com.CodeSpace.careerinfo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final UserSkillRepository userSkillRepository;
    private final CareerRepository careerRepository;
    private final CareerSkillRepository careerSkillRepository;

    public List<CareerRecommendationDTO> getRecommendations(Long userId) {
        // Get user's skills
        List<UserSkills> userSkills = userSkillRepository.findByUserId(userId);

        if (userSkills.isEmpty()) {
            return new ArrayList<>();
        }

        // Create a map of user's skills with their proficiency levels
        Map<Long, String> userSkillMap = userSkills.stream()
                .collect(Collectors.toMap(
                        us -> us.getSkill().getId(),
                        UserSkills::getProficiencyLevel
                ));

        // Get all careers
        List<Career> allCareers = careerRepository.findAll();

        List<CareerRecommendationDTO> recommendations = new ArrayList<>();

        for (Career career : allCareers) {
            // Get required skills for this career
            List<CareerSkills> requiredSkills = careerSkillRepository.findByCareerId(career.getId());

            if (requiredSkills.isEmpty()) {
                continue;
            }

            // Calculate match percentage
            int matchedSkills = 0;
            for (CareerSkills requiredSkill : requiredSkills) {
                if (userSkillMap.containsKey(requiredSkill.getSkill().getId())) {
                    String userLevel = userSkillMap.get(requiredSkill.getSkill().getId());
                    String requiredLevel = requiredSkill.getRequiredLevel();

                    // Check if user's proficiency meets or exceeds requirement
                    if (isProficiencySufficient(userLevel, requiredLevel)) {
                        matchedSkills++;
                    }
                }
            }

            // Calculate match percentage
            double matchPercentage = (matchedSkills * 100.0) / requiredSkills.size();

            // Create recommendation DTO
            CareerRecommendationDTO dto = new CareerRecommendationDTO();
            dto.setCareerId(career.getId());
            dto.setCareerName(career.getCareerName());
            dto.setDescription(career.getDescription());
            dto.setMatchPercentage(matchPercentage);
            dto.setDemandLevel(Math.round(career.getDemandLevel()));
            dto.setAverageSalary(career.getAverageSalary());

            recommendations.add(dto);
        }

        // Sort by match percentage (highest first)
        recommendations.sort((a, b) -> Double.compare(b.getMatchPercentage(), a.getMatchPercentage()));

        return recommendations;
    }

    public CareerRecommendationDTO getCareerAnalysis(Long userId, Long careerId) {
        // Get user's skills
        List<UserSkills> userSkills = userSkillRepository.findByUserId(userId);
        Map<Long, String> userSkillMap = userSkills.stream()
                .collect(Collectors.toMap(
                        us -> us.getSkill().getId(),
                        UserSkills::getProficiencyLevel
                ));

        // Get career
        Career career = careerRepository.findById(careerId)
                .orElseThrow(() -> new RuntimeException("Career not found"));

        // Get required skills for this career
        List<CareerSkills> requiredSkills = careerSkillRepository.findByCareerId(careerId);

        List<SkillGapDTO> skillGaps = new ArrayList<>();
        int matchedSkills = 0;

        for (CareerSkills requiredSkill : requiredSkills) {
            SkillGapDTO gap = new SkillGapDTO();
            gap.setSkillId(requiredSkill.getSkill().getId());
            gap.setSkillName(requiredSkill.getSkill().getSkillName());
            gap.setRequiredLevel(requiredSkill.getRequiredLevel());

            if (userSkillMap.containsKey(requiredSkill.getSkill().getId())) {
                String userLevel = userSkillMap.get(requiredSkill.getSkill().getId());
                gap.setUserLevel(userLevel);

                if (isProficiencySufficient(userLevel, requiredSkill.getRequiredLevel())) {
                    gap.setMatched(true);
                    matchedSkills++;
                } else {
                    gap.setMatched(false);
                }
            } else {
                gap.setUserLevel(null);
                gap.setMatched(false);
            }

            skillGaps.add(gap);
        }

        // Calculate match percentage
        double matchPercentage = requiredSkills.isEmpty() ? 0 : (matchedSkills * 100.0) / requiredSkills.size();

        // Create response
        CareerRecommendationDTO dto = new CareerRecommendationDTO();
        dto.setCareerId(career.getId());
        dto.setCareerName(career.getCareerName());
        dto.setDescription(career.getDescription());
        dto.setMatchPercentage(matchPercentage);
        dto.setDemandLevel(Math.round(career.getDemandLevel()));
        dto.setAverageSalary(career.getAverageSalary());
        dto.setSkillGaps(skillGaps);

        return dto;
    }

    private boolean isProficiencySufficient(String userLevel, String requiredLevel) {
        int userLevelInt = getProficiencyValue(userLevel);
        int requiredLevelInt = getProficiencyValue(requiredLevel);
        return userLevelInt >= requiredLevelInt;
    }

    private int getProficiencyValue(String level) {
        return switch (level) {
            case "Beginner" -> 1;
            case "Intermediate" -> 2;
            case "Advanced" -> 3;
            case "Expert" -> 4;
            default -> 0;
        };
    }
}