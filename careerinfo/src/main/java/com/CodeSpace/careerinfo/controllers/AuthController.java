package com.CodeSpace.careerinfo.controllers;

import com.CodeSpace.careerinfo.dto.LoginDTO;
import com.CodeSpace.careerinfo.dto.RegisterDTO;
import com.CodeSpace.careerinfo.dto.UserDTO;
import com.CodeSpace.careerinfo.model.User;
import com.CodeSpace.careerinfo.repository.UserRepository;
import com.CodeSpace.careerinfo.service.UserService;
import com.CodeSpace.careerinfo.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@RequestBody RegisterDTO registerDTO) {
        UserDTO userDTO = userService.createUser(registerDTO);
        return new ResponseEntity<>(userDTO, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {

        User user = userRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("Email not found"));

        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials");
        }

        String token = jwtUtils.generateToken(user.getEmail());
        return ResponseEntity.ok(Map.of("token", token));
    }
}
