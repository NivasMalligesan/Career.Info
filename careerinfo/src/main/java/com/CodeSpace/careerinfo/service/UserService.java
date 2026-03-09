package com.CodeSpace.careerinfo.service;

import com.CodeSpace.careerinfo.dto.RegisterDTO;
import com.CodeSpace.careerinfo.dto.UserDTO;
import com.CodeSpace.careerinfo.dto.UserSkillDTO;
import com.CodeSpace.careerinfo.model.Skill;
import com.CodeSpace.careerinfo.model.User;
import com.CodeSpace.careerinfo.model.UserSkills;
import com.CodeSpace.careerinfo.repository.SkillRepository;
import com.CodeSpace.careerinfo.repository.UserRepository;
import com.CodeSpace.careerinfo.repository.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final SkillRepository skillRepository;
    private final PasswordEncoder passwordEncoder;

    // USER RELATED POST, GET, PUT, DELETE

    public UserDTO createUser(RegisterDTO registerDTO) {
        if (userRepository.findByEmail(registerDTO.getEmail()).isPresent()) {
            throw new RuntimeException("User Already Exist");
        }

        User user = new User();
        user.setName(registerDTO.getName());
        user.setEmail(registerDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));

        // ✅ CRITICAL FIX: Set default role to "USER" instead of using registerDTO.getRole()
        user.setRole("USER");

        User savedUser = userRepository.save(user);

        return mapToUserDTO(savedUser);
    }

    public UserDTO getUserProfile(Long userId) {
        User fetchedUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not Found, Register First"));
        return mapToUserDTO(fetchedUser);
    }

    public UserDTO updateUserProfile(Long userId, UserDTO userDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        user.setName(userDTO.getName());
        // Don't allow role update from user profile
        // user.setRole(userDTO.getRole());

        User updatedUser = userRepository.save(user);
        return mapToUserDTO(updatedUser);
    }

    // SKILL RELATED POST, GET, PUT, DELETE

    public UserSkillDTO addUserSkills(Long userId, UserSkillDTO userSkillDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not Found"));
        Skill skill = skillRepository.findById(userSkillDTO.getSkillId())
                .orElseThrow(() -> new RuntimeException("Skills Not found"));

        if (userSkillRepository.existsByUserIdAndSkillId(userId, userSkillDTO.getSkillId())) {
            throw new RuntimeException("User already has this skill");
        }

        UserSkills userSkills = UserSkills.builder()
                .user(user)
                .skill(skill)
                .proficiencyLevel(userSkillDTO.getProficiencyLevel())
                .build();

        UserSkills addedSkill = userSkillRepository.save(userSkills);

        return mapToUserSkillDTO(addedSkill);
    }

    public List<UserSkillDTO> getUserSkills(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserSkills> skills = userSkillRepository.findByUserId(userId);
        return skills.stream()
                .map(this::mapToUserSkillDTO)
                .toList();
    }

    public UserSkillDTO updateUserSkill(Long userId, UserSkillDTO dto) {
        UserSkills userSkills = userSkillRepository.findByUserIdAndSkillId(userId, dto.getSkillId())
                .orElseThrow(() -> new RuntimeException("The skill is Not found for the particular user"));
        userSkills.setProficiencyLevel(dto.getProficiencyLevel());
        return mapToUserSkillDTO(userSkillRepository.save(userSkills));
    }

    public void deleteUserSkills(Long userSkillId) {
        UserSkills userSkills = userSkillRepository.findById(userSkillId)
                .orElseThrow(() -> new RuntimeException("Skill Not Found"));
        userSkillRepository.delete(userSkills);
    }

    // DATA TRANSFER OBJECTS

    private UserSkillDTO mapToUserSkillDTO(UserSkills userSkills) {
        UserSkillDTO dto = new UserSkillDTO();
        dto.setId(userSkills.getId());
        dto.setSkillId(userSkills.getSkill().getId());
        dto.setSkillName(userSkills.getSkill().getSkillName());
        dto.setProficiencyLevel(userSkills.getProficiencyLevel());
        return dto;
    }

    private UserDTO mapToUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        return dto;
    }
}