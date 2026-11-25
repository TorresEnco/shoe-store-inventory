package com.shoestore.inventory.user.infrastructure.adapters.in.web.dto;

import com.shoestore.inventory.user.domain.model.Role;
import com.shoestore.inventory.user.domain.model.User;

public record UserResponse(
		Long id,
		String fullName,
		String username,
		Role role,
		Boolean active) {

	public static UserResponse from(User user) {
		return new UserResponse(
				user.getId(),
				user.getFullName(),
				user.getUsername(),
				user.getRole(),
				user.getActive());
	}
}
