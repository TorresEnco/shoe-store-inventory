package com.shoestore.inventory.user.infrastructure.adapters.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
		@NotBlank @Size(max = 255) String username,
		@NotBlank String password) {
}
