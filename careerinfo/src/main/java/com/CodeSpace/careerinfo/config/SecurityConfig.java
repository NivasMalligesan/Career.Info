package com.CodeSpace.careerinfo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.CodeSpace.careerinfo.utils.JwtFilter;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            JwtFilter jwtFilter
    ) throws Exception {

        http
                .cors(cors -> cors.configure(http))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth

                        // ✅ Allow OPTIONS requests (for CORS preflight)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ✅ Allow auth endpoints without authentication
                        .requestMatchers("/auth/**").permitAll()

                        // ✅ Allow public GET access to skills and careers
                        .requestMatchers(HttpMethod.GET, "/api/skill/**", "/api/career/**").permitAll()

                        // ✅ ADMIN can manage careers and skills (POST, PUT, DELETE)
                        .requestMatchers(HttpMethod.POST, "/api/career/**", "/api/skill/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/career/**", "/api/skill/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/career/**", "/api/skill/**").hasRole("ADMIN")

                        // ✅ Admin endpoints - ADMIN only
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // ✅ User and recommendations - USER and ADMIN can access
                        .requestMatchers("/api/user/**", "/api/recommendations/**", "/api/analysis/**")
                        .hasAnyRole("USER", "ADMIN")

                        // ✅ All other requests require authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}