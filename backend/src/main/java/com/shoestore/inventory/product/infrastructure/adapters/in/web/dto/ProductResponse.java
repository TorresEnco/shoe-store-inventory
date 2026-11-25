package com.shoestore.inventory.product.infrastructure.adapters.in.web.dto;

import com.shoestore.inventory.product.domain.model.Product;

import java.time.LocalDateTime;
import java.util.List;

public record ProductResponse(
		Long id,
		String name,
		String description,
		Long categoryId,
		String categoryName,
		Long brandId,
		String brandName,
		Boolean status,
		LocalDateTime createdAt,
		List<VariantResponse> variants) {

	public static ProductResponse from(Product product) {
		return new ProductResponse(
				product.getId(),
				product.getName(),
				product.getDescription(),
				product.getCategory() == null ? null : product.getCategory().getId(),
				product.getCategory() == null ? null : product.getCategory().getDescription(),
				product.getBrand() == null ? null : product.getBrand().getId(),
				product.getBrand() == null ? null : product.getBrand().getName(),
				product.getStatus(),
				product.getCreatedAt(),
				product.getVariants() == null
						? List.of()
						: product.getVariants().stream().map(VariantResponse::from).toList());
	}
}
