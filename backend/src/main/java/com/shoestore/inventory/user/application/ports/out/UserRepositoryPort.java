package com.shoestore.inventory.user.application.ports.out;

import com.shoestore.inventory.user.domain.model.User;

import java.util.List;
import java.util.Optional;

public interface UserRepositoryPort {

	List<User> findAll();

	Optional<User> findById(Long id);

	Optional<User> findByUsername(String username);

	User save(User user);

	boolean existsByUsername(String username);

	void lockForBootstrap();
}
