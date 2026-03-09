package com.CodeSpace.careerinfo.service;

import com.CodeSpace.careerinfo.dto.CareerDTO;
import com.CodeSpace.careerinfo.dto.CareerSkillDTO;
import com.CodeSpace.careerinfo.model.Career;
import com.CodeSpace.careerinfo.model.CareerSkills;
import com.CodeSpace.careerinfo.model.Skill;
import com.CodeSpace.careerinfo.repository.CareerRepository;
import com.CodeSpace.careerinfo.repository.CareerSkillRepository;
import com.CodeSpace.careerinfo.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CareerService {
    
    private final CareerRepository careerRepository;
    private final SkillRepository skillRepository;
    private final CareerSkillRepository careerSkillRepository;

    @Transactional
    public CareerDTO createCareer(CareerDTO careerDTO) {
        // Check if career already exists
        if (careerRepository.findByCareerName(careerDTO.getCareerName()).isPresent()) {
            throw new RuntimeException("Career already exists");
        }

        // Create career entity
        Career career = Career.builder()
                .careerName(careerDTO.getCareerName())
                .description(careerDTO.getDescription())
                .demandLevel(careerDTO.getDemandLevel().floatValue())
                .averageSalary(careerDTO.getAverageSalary())
                .build();

        Career savedCareer = careerRepository.save(career);

        // Add required skills if provided
        if (careerDTO.getRequiredSkills() != null && !careerDTO.getRequiredSkills().isEmpty()) {
            for (CareerSkillDTO skillDTO : careerDTO.getRequiredSkills()) {
                Skill skill = skillRepository.findById(skillDTO.getSkillId())
                        .orElseThrow(() -> new RuntimeException("Skill not found: " + skillDTO.getSkillId()));

                CareerSkills careerSkill = CareerSkills.builder()
                        .career(savedCareer)
                        .skill(skill)
                        .requiredLevel(skillDTO.getRequiredLevel())
                        .build();

                careerSkillRepository.save(careerSkill);
            }
        }

        return mapToCareerDTO(savedCareer);
    }

    public List<CareerDTO> getAllCareers() {
        List<Career> careers = careerRepository.findAll();
        return careers.stream()
                .map(this::mapToCareerDTO)
                .collect(Collectors.toList());
    }

    public CareerDTO getCareerById(Long careerId) {
        Career career = careerRepository.findById(careerId)
                .orElseThrow(() -> new RuntimeException("Career not found"));
        return mapToCareerDTO(career);
    }

    @Transactional
    public CareerDTO updateCareer(Long careerId, CareerDTO careerDTO) {
        Career career = careerRepository.findById(careerId)
                .orElseThrow(() -> new RuntimeException("Career not found"));

        // Check if new name already exists (excluding current career)
        careerRepository.findByCareerName(careerDTO.getCareerName())
                .ifPresent(existingCareer -> {
                    if (!existingCareer.getId().equals(careerId)) {
                        throw new RuntimeException("Career name already exists");
                    }
                });

        // Update career details
        career.setCareerName(careerDTO.getCareerName());
        career.setDescription(careerDTO.getDescription());
        career.setDemandLevel(careerDTO.getDemandLevel().floatValue());
        career.setAverageSalary(careerDTO.getAverageSalary());

        Career updatedCareer = careerRepository.save(career);

        // Update required skills
        if (careerDTO.getRequiredSkills() != null) {
            // Delete existing career skills
            careerSkillRepository.deleteByCareerId(careerId);

            // Add new career skills
            for (CareerSkillDTO skillDTO : careerDTO.getRequiredSkills()) {
                Skill skill = skillRepository.findById(skillDTO.getSkillId())
                        .orElseThrow(() -> new RuntimeException("Skill not found: " + skillDTO.getSkillId()));

                CareerSkills careerSkill = CareerSkills.builder()
                        .career(updatedCareer)
                        .skill(skill)
                        .requiredLevel(skillDTO.getRequiredLevel())
                        .build();

                careerSkillRepository.save(careerSkill);
            }
        }

        return mapToCareerDTO(updatedCareer);
    }

    @Transactional
    public void deleteCareer(Long careerId) {
        if (!careerRepository.existsById(careerId)) {
            throw new RuntimeException("Career not found");
        }

        // Delete associated career skills first
        careerSkillRepository.deleteByCareerId(careerId);

        // Delete career
        careerRepository.deleteById(careerId);
    }

    private CareerDTO mapToCareerDTO(Career career) {
        CareerDTO dto = new CareerDTO();
        dto.setId(career.getId());
        dto.setCareerName(career.getCareerName());
        dto.setDescription(career.getDescription());
        dto.setDemandLevel(career.getDemandLevel().intValue());
        dto.setAverageSalary(career.getAverageSalary());

        // Get required skills
        List<CareerSkills> careerSkills = careerSkillRepository.findByCareerId(career.getId());
        List<CareerSkillDTO> requiredSkills = careerSkills.stream()
                .map(cs -> {
                    CareerSkillDTO skillDTO = new CareerSkillDTO();
                    skillDTO.setSkillId(cs.getSkill().getId());
                    skillDTO.setSkillName(cs.getSkill().getSkillName());
                    skillDTO.setRequiredLevel(cs.getRequiredLevel());
                    return skillDTO;
                })
                .collect(Collectors.toList());

        dto.setRequiredSkills(requiredSkills);

        return dto;
    }
}