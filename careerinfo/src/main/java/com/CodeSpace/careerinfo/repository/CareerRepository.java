package com.CodeSpace.careerinfo.repository;

import com.CodeSpace.careerinfo.model.Career;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CareerRepository extends JpaRepository<Career,Long> {
}
