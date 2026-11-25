package com.shoestore.inventory.user.application.service;

import com.shoestore.inventory.user.application.ports.in.LoginUseCase;
import com.shoestore.inventory.user.application.ports.in.UserManagementUseCase;
import com.shoestore.inventory.user.application.ports.out.UserRepositoryPort;
import com.shoestore.inventory.user.domain.exception.InvalidCredentialsException;
import com.shoestore.inventory.user.domain.exception.UserNotFoundException;
import com.shoestore.inventory.user.domain.model.Role;
import com.shoestore.inventory.user.domain.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class UserService implements LoginUseCase, UserManagementUseCase {

	private final UserRepositoryPort userRepositoryPort;
	private final PasswordEncoder passwordEncoder;

	public UserService(UserRepositoryPort userRepositoryPort, PasswordEncoder passwordEncoder) {
		this.userRepositoryPort = userRepositoryPort;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public User login(String username, String rawPassword) {
		User user = userRepositoryPort.findByUsername(username)
				.orElseThrow(() -> new InvalidCredentialsException("Usuario o contraseña incorrectos"));

		if (!Boolean.TRUE.equals(user.getActive())
				|| !passwordEncoder.matches(rawPassword, user.getPassword())) {
			throw new InvalidCredentialsException("Usuario o contraseña incorrectos");
		}

		user.setPassword(null);
		return user;
	}

	@Override
	public List<User> getAllUsers() {
		return userRepositoryPort.findAll().stream()
				.sorted(Comparator
						.comparing((User user) -> user.getRole() == null ? "" : user.getRole().name())
						.thenComparing(User::getFullName, String.CASE_INSENSITIVE_ORDER))
				.toList();
	}

	@Override
	@Transactional
	public User createUser(User user) {
		user.setPassword(passwordEncoder.encode(user.getPassword()));
		if (user.getActive() == null) {
			user.setActive(Boolean.TRUE);
		}
		return userRepositoryPort.save(user);
	}

	@Override
	@Transactional
	public void createFirstAdmin(String username, String fullName, String password) {
		userRepositoryPort.lockForBootstrap();
		if (userRepositoryPort.findAll().stream().anyMatch(UserService::isActiveAdmin)) {
			throw new IllegalStateException("Ya existe un administrador activo.");
		}
		if (userRepositoryPort.existsByUsername(username)) {
			throw new IllegalStateException("El usuario de aprovisionamiento ya existe.");
		}
		User admin = new User();
		admin.setUsername(username);
		admin.setFullName(fullName);
		admin.setRole(Role.ADMIN);
		admin.setPassword(password);
		createUser(admin);
	}

	@Override
	@Transactional
	public User toggleUserStatus(Long userId, Long currentUserId) {
		User user = userRepositoryPort.findById(userId)
				.orElseThrow(() -> new UserNotFoundException("User not found with id " + userId));

		boolean newStatus = !Boolean.TRUE.equals(user.getActive());
		if (!newStatus) {
			if ("admin".equalsIgnoreCase(user.getUsername())) {
				throw new ResponseStatusException(HttpStatus.FORBIDDEN,
						"La cuenta principal del dueño está protegida y no puede desactivarse.");
			}
			if (user.getId().equals(currentUserId)) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
						"No puedes desactivar tu propia cuenta.");
			}
			if (isLastActiveAdmin(user)) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
						"No puedes desactivar al último administrador activo.");
			}
		}

		user.setActive(newStatus);
		return userRepositoryPort.save(user);
	}

	private boolean isLastActiveAdmin(User user) {
		if (user.getRole() != Role.ADMIN) {
			return false;
		}
		long activeAdmins = userRepositoryPort.findAll().stream()
				.filter(UserService::isActiveAdmin)
				.count();
		return activeAdmins <= 1;
	}

	private static boolean isActiveAdmin(User user) {
		return user.getRole() == Role.ADMIN && Boolean.TRUE.equals(user.getActive());
	}
}
