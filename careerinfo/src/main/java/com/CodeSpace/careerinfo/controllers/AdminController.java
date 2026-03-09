package com.CodeSpace.careerinfo.controllers;

import com.CodeSpace.careerinfo.dto.UserDTOforAdmin;
import com.CodeSpace.careerinfo.service.UserAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class AdminController {

    private final UserAdminService userAdminService;

    @GetMapping
    public ResponseEntity<List<UserDTOforAdmin>> getUser() {
        List<UserDTOforAdmin> fetchedUser = userAdminService.getAllUsers();
        return new ResponseEntity<>(fetchedUser, HttpStatus.OK);
    }

    @PatchMapping("/{userId}/role")
    public ResponseEntity<UserDTOforAdmin> updateUserRole(
            @PathVariable Long userId,
            @RequestParam String role) {
        UserDTOforAdmin updatedUser = userAdminService.updateUserRole(userId, role);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }
}