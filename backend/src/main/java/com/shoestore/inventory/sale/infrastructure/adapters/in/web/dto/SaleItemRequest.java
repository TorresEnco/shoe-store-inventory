package com.shoestore.inventory.sale.infrastructure.adapters.in.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record SaleItemRequest(
		@NotNull Long variantId,
		@NotNull @Positive BigDecimal unitPrice,
		@NotNull @Positive Integer quantity) {
}
