package com.CodeSpace.careerinfo.controllers;


import com.CodeSpace.careerinfo.dto.SkillDTO;
import com.CodeSpace.careerinfo.service.SkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/skill")
public class SkillsController {
    private final SkillService skillService;

    @PostMapping("/")
    ResponseEntity<SkillDTO> addNewSkills(@RequestBody SkillDTO skillDTO){
        SkillDTO addedSkill = skillService.addNewSkills(skillDTO);
        return new ResponseEntity<>(addedSkill, HttpStatus.CREATED);
    }

    @GetMapping("{skillId}")
    ResponseEntity<SkillDTO> getSkillById(@PathVariable Long skillId){
        SkillDTO fetchedSkill = skillService.getSkillById(skillId);
        return new ResponseEntity<>(fetchedSkill, HttpStatus.OK);
    }

    @GetMapping
    ResponseEntity<List<SkillDTO>> getAllSkills(){
        List<SkillDTO> allSkills = skillService.getAllSkills();
        return new ResponseEntity<>(allSkills,HttpStatus.OK);
    }

    @PutMapping("/{skillId}")
    ResponseEntity<SkillDTO> updateSkills(@PathVariable Long skillId,@RequestBody SkillDTO skillDTO){
        SkillDTO updatedSkill = skillService.updateSkills(skillId,skillDTO);
        return new ResponseEntity<>(updatedSkill, HttpStatus.CREATED);
    }

    @DeleteMapping("/{skillId}")
    void deleteSkill(@PathVariable Long skillId){
        skillService.deleteSkill(skillId);
    }

}