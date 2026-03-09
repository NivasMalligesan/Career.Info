package com.CodeSpace.careerinfo.service;

import com.CodeSpace.careerinfo.dto.UserDTOforAdmin;
import com.CodeSpace.careerinfo.model.User;
import com.CodeSpace.careerinfo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final UserRepository userRepository;

    public List<UserDTOforAdmin> getAllUsers() {
        List<User> users = userRepository.findAll();

        return users.stream()
                .map(this::mapToUserDTO)
                .collect(Collectors.toList());
    }

    public UserDTOforAdmin updateUserRole(Long userId, String newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Validate role
        if (!newRole.equals("USER") && !newRole.equals("ADMIN")) {
            throw new IllegalArgumentException("Invalid role. Must be USER or ADMIN");
        }

        user.setRole(newRole);
        User updatedUser = userRepository.save(user);

        return mapToUserDTO(updatedUser);
    }

    private UserDTOforAdmin mapToUserDTO(User user) {
        UserDTOforAdmin dto = new UserDTOforAdmin();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        return dto;
    }
}