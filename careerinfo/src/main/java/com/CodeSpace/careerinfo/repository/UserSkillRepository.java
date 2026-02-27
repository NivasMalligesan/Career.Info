package com.CodeSpace.careerinfo.repository;

import com.CodeSpace.careerinfo.model.UserSkills;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserSkillRepository extends JpaRepository<UserSkills , Long> {
    List<UserSkills> findByUserId(Long userId);
    boolean existsByUserIdAndSkillId(Long userId, Long skillId);
    Optional<UserSkills> findByUserIdAndSkillId(Long userId , Long skillId);
    void deleteByUserIdAndSkillId(Long userId , Long skillId);
}
