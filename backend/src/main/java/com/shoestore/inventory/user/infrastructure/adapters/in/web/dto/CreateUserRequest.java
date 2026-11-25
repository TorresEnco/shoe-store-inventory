package com.shoestore.inventory.user.infrastructure.adapters.in.web.dto;

import com.shoestore.inventory.user.domain.model.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateUserRequest(
		@NotBlank String fullName,
		@NotBlank String username,
		@NotBlank String password,
		@NotNull Role role) {
}
