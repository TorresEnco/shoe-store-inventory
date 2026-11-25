package com.shoestore.inventory.user.infrastructure.adapters.in.web.dto;

import com.shoestore.inventory.user.domain.model.Role;
import com.shoestore.inventory.user.domain.model.User;

public record LoginResponse(
		Long id,
		String fullName,
		String username,
		Role role) {

	public static LoginResponse from(User user) {
		return new LoginResponse(
				user.getId(),
				user.getFullName(),
				user.getUsername(),
				user.getRole());
	}
}
