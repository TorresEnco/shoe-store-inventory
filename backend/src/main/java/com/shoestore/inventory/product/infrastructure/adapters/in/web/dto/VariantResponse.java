package com.shoestore.inventory.product.infrastructure.adapters.in.web.dto;

import com.shoestore.inventory.product.domain.model.ProductVariant;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record VariantResponse(
		Long id,
		Long colorId,
		String colorName,
		Integer size,
		BigDecimal catalogPrice,
		Integer stock,
		LocalDateTime createdAt) {

	public static VariantResponse from(ProductVariant variant) {
		return new VariantResponse(
				variant.getId(),
				variant.getColor() == null ? null : variant.getColor().getId(),
				variant.getColor() == null ? null : variant.getColor().getName(),
				variant.getSize(),
				variant.getCatalogPrice(),
				variant.getStock(),
				variant.getCreatedAt());
	}
}
