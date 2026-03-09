package com.CodeSpace.careerinfo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.CodeSpace.careerinfo.model.CareerSkills;

@Repository
public interface CareerSkillRepository extends JpaRepository<CareerSkills, Long> {
    List<CareerSkills> findByCareerId(Long careerId);
    void deleteByCareerId(Long careerId);
    void deleteBySkillId(Long SkillId);
}