package com.shoestore.inventory.user.infrastructure.adapters.in.web;

import com.shoestore.inventory.user.application.ports.in.UserManagementUseCase;
import com.shoestore.inventory.user.domain.exception.UserNotFoundException;
import com.shoestore.inventory.user.domain.model.User;
import com.shoestore.inventory.user.infrastructure.adapters.in.web.dto.CreateUserRequest;
import com.shoestore.inventory.user.infrastructure.adapters.in.web.dto.UserResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.shoestore.inventory.user.infrastructure.adapters.in.web.dto.LoginResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

	private final UserManagementUseCase userManagementUseCase;

	public UserController(UserManagementUseCase userManagementUseCase) {
		this.userManagementUseCase = userManagementUseCase;
	}

	@GetMapping
	public List<UserResponse> getAllUsers() {
		return userManagementUseCase.getAllUsers().stream()
				.map(UserResponse::from)
				.toList();
	}

	@PostMapping
	public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
		User created = userManagementUseCase.createUser(toDomain(request));
		return ResponseEntity.status(HttpStatus.CREATED).body(UserResponse.from(created));
	}

	@PatchMapping("/{id}/toggle-status")
	public UserResponse toggleUserStatus(@PathVariable Long id,
			@AuthenticationPrincipal LoginResponse actor) {
		return UserResponse.from(userManagementUseCase.toggleUserStatus(id, actor.id()));
	}

	@ExceptionHandler(UserNotFoundException.class)
	public ResponseEntity<String> handleUserNotFound(UserNotFoundException exception) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(exception.getMessage());
	}

	private User toDomain(CreateUserRequest request) {
		User user = new User();
		user.setFullName(request.fullName());
		user.setUsername(request.username());
		user.setPassword(request.password());
		user.setRole(request.role());
		user.setActive(Boolean.TRUE);
		return user;
	}
}
