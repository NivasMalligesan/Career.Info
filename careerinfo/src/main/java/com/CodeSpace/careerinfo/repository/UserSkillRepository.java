package com.CodeSpace.careerinfo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.CodeSpace.careerinfo.model.UserSkills;

@Repository
public interface UserSkillRepository extends JpaRepository<UserSkills, Long> {
    List<UserSkills> findByUserId(Long userId);
    Optional<UserSkills> findByUserIdAndSkillId(Long userId, Long skillId);
    boolean existsByUserIdAndSkillId(Long userId, Long skillId);
    void deleteBySkillId(Long SkillId);
}