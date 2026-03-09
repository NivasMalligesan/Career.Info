package com.CodeSpace.careerinfo.controllers;


import com.CodeSpace.careerinfo.dto.RegisterDTO;
import com.CodeSpace.careerinfo.dto.UserDTO;
import com.CodeSpace.careerinfo.dto.UserSkillDTO;
import com.CodeSpace.careerinfo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    //Profile Details and Things

    @PostMapping("/create")
    ResponseEntity<UserDTO> createUser(@RequestBody RegisterDTO registerDTO){
        UserDTO createdUser = userService.createUser(registerDTO);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @GetMapping("{userId}/profile")
    ResponseEntity<UserDTO> getUserProfile(@PathVariable Long userId){
        UserDTO fetchedUser = userService.getUserProfile(userId);
        return new ResponseEntity<>(fetchedUser,HttpStatus.OK);
    }

    @PutMapping("{userId}/profile")
    ResponseEntity<UserDTO> updateUserProfile(@PathVariable Long userId , @RequestBody UserDTO userDTO){
        UserDTO updatedUser = userService.updateUserProfile(userId,userDTO);
        return new ResponseEntity<>(updatedUser,HttpStatus.CREATED);
    }

    //Skill Add ,Get, Update , Delete

    @PostMapping("{userId}/skill")
    ResponseEntity<UserSkillDTO> addUserSkills(@PathVariable Long userId , @RequestBody UserSkillDTO userSkillDTO){
        UserSkillDTO addedSkill = userService.addUserSkills(userId,userSkillDTO);
        return new ResponseEntity<>(addedSkill,HttpStatus.CREATED);
    }

    @GetMapping("/{userId}/skill")
    ResponseEntity<List<UserSkillDTO>> getUserSkills(@PathVariable Long userId){
        List<UserSkillDTO> allUserSkill = userService.getUserSkills(userId);
        return new ResponseEntity<>(allUserSkill,HttpStatus.OK);
    }

    @PutMapping("/{userId}/skill")
    ResponseEntity<UserSkillDTO> updateUserSkill(@PathVariable Long userId , @RequestBody UserSkillDTO userSkillDTO){
        return new ResponseEntity<>(userService.updateUserSkill(userId,userSkillDTO),HttpStatus.OK);
    }

    @DeleteMapping("/{userId}/skill/{userSkillId}")
    ResponseEntity<String> deleteUserSkill(@PathVariable Long userSkillId){
        userService.deleteUserSkills(userSkillId);
        return new ResponseEntity<>("Skill Deleted Succesfully",HttpStatus.OK);
    }

}
