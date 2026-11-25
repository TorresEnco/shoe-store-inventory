package com.shoestore.inventory.user.infrastructure.adapters.out.persistence;

import com.shoestore.inventory.user.application.ports.out.UserRepositoryPort;
import com.shoestore.inventory.user.domain.model.User;
import com.shoestore.inventory.user.infrastructure.adapters.out.persistence.mapper.UserMapper;
import com.shoestore.inventory.user.infrastructure.adapters.out.persistence.repository.SpringDataUserRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class UserPersistenceAdapter implements UserRepositoryPort {

	private final SpringDataUserRepository userRepository;
	private final UserMapper mapper;
	private final JdbcTemplate jdbc;

	public UserPersistenceAdapter(SpringDataUserRepository userRepository, UserMapper mapper, JdbcTemplate jdbc) {
		this.userRepository = userRepository;
		this.mapper = mapper;
		this.jdbc = jdbc;
	}

	@Override
	public List<User> findAll() {
		return userRepository.findAll().stream()
				.map(mapper::toDomain)
				.toList();
	}

	@Override
	public Optional<User> findById(Long id) {
		return userRepository.findById(id).map(mapper::toDomain);
	}

	@Override
	public Optional<User> findByUsername(String username) {
		return userRepository.findByUsername(username).map(mapper::toDomain);
	}

	@Override
	public User save(User user) {
		return mapper.toDomain(userRepository.save(mapper.toEntity(user)));
	}

	@Override
	public boolean existsByUsername(String username) {
		return userRepository.existsByUsername(username);
	}

	@Override
	public void lockForBootstrap() {
		jdbc.execute("SET LOCAL lock_timeout = '5s'");
		jdbc.execute("LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE");
	}
}
