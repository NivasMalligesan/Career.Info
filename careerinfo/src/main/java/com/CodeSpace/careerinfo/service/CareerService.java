package com.CodeSpace.careerinfo.service;


import com.CodeSpace.careerinfo.repository.CareerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CareerService {
    public final CareerRepository careerRepository;


}
