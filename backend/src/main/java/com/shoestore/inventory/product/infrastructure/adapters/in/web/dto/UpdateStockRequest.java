package com.shoestore.inventory.product.infrastructure.adapters.in.web.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateStockRequest(@NotNull Integer delta) {
}
