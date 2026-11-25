package com.shoestore.inventory.user.infrastructure.adapters.out.persistence.repository;

import com.shoestore.inventory.user.infrastructure.adapters.out.persistence.entity.UserJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SpringDataUserRepository extends JpaRepository<UserJpaEntity, Long> {

	Optional<UserJpaEntity> findByUsername(String username);

	boolean existsByUsername(String username);
}
