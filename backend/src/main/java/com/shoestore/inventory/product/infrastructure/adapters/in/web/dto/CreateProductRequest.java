package com.shoestore.inventory.product.infrastructure.adapters.in.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.List;

public record CreateProductRequest(
		@NotBlank String name,
		String description,
		@NotNull Long categoryId,
		@NotNull Long brandId,
		Boolean status,
		@Valid List<VariantRequest> variants) {

	public record VariantRequest(
			@NotNull Long colorId,
			@NotNull Integer size,
			@NotNull @PositiveOrZero BigDecimal catalogPrice,
			@PositiveOrZero Integer stock) {
	}
}
