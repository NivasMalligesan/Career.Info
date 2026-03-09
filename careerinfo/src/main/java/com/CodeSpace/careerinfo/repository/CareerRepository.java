package com.CodeSpace.careerinfo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.CodeSpace.careerinfo.model.Career;

@Repository
public interface CareerRepository extends JpaRepository<Career, Long> {
    Optional<Career> findByCareerName(String careerName);
}