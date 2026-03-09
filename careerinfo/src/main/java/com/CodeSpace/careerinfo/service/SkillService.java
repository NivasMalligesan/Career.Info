package com.CodeSpace.careerinfo.service;

import com.CodeSpace.careerinfo.dto.SkillDTO;
import com.CodeSpace.careerinfo.model.Skill;
import com.CodeSpace.careerinfo.repository.CareerSkillRepository;
import com.CodeSpace.careerinfo.repository.SkillRepository;
import com.CodeSpace.careerinfo.repository.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillService {
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final CareerSkillRepository careerSkillRepository;

    public SkillDTO addNewSkills(SkillDTO skillDTO){

        if(skillRepository.findBySkillName(skillDTO.getSkillName()).isPresent()){
            throw new RuntimeException("Skill Already Exist");
        }
        Skill skill = new Skill();
        skill.setSkillName(skillDTO.getSkillName());
        skill.setCategory(skillDTO.getCategory());
        skill.setDescription(skillDTO.getDescription());

        Skill addedNewSkill = skillRepository.save(skill);

        return mapToSkillDTO(addedNewSkill);
    }

    public List<SkillDTO> getAllSkills(){
        List<Skill> skills = skillRepository.findAll();
        return skills.stream()
                .map(this::mapToSkillDTO)
                .collect(Collectors.toList());
    }

    public SkillDTO getSkillById(Long skillId){
        Skill skills = skillRepository.findById(skillId).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Skill Do Not Exist."));
        return mapToSkillDTO(skills);
    }

    public SkillDTO updateSkills(Long skillId , SkillDTO skillDTO){
        Skill skill = skillRepository.findById(skillId).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Skill Do Not Exist."));

        skillRepository.findBySkillName(skillDTO.getSkillName())
                .ifPresent(existingSkill -> {
                    if (!existingSkill.getId().equals(skillId)) {
                        throw new RuntimeException("Skill name already exists");
                    }});

        skill.setSkillName(skillDTO.getSkillName());
        skill.setCategory(skillDTO.getCategory());
        skill.setDescription(skillDTO.getDescription());

        Skill updatedSkill = skillRepository.save(skill);
        return mapToSkillDTO(updatedSkill);
    }

    @Transactional
    public void deleteSkill(Long skillId){
        if (!skillRepository.existsById(skillId)) {
            throw new RuntimeException("Skill not found");
        }

        userSkillRepository.deleteBySkillId(skillId);
        careerSkillRepository.deleteBySkillId(skillId);
        skillRepository.deleteById(skillId);
    }


    private SkillDTO mapToSkillDTO(Skill skill){
        SkillDTO skillDTO = new SkillDTO();
        skillDTO.setId(skill.getId());
        skillDTO.setSkillName(skill.getSkillName());
        skillDTO.setCategory(skill.getCategory());
        skillDTO.setDescription(skill.getDescription());
        return skillDTO;
    }
}
