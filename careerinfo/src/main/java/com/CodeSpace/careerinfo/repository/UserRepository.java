package com.CodeSpace.careerinfo.repository;

import com.CodeSpace.careerinfo.dto.UserDTO;
import com.CodeSpace.careerinfo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByEmail(String email);
}
