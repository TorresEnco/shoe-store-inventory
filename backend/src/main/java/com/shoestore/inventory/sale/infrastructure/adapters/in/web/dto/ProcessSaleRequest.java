package com.shoestore.inventory.sale.infrastructure.adapters.in.web.dto;

import com.shoestore.inventory.sale.domain.model.PaymentType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ProcessSaleRequest(
		String customerName,
		String customerPhone,
		@NotNull PaymentType paymentType,
		@jakarta.validation.constraints.NotEmpty List<@NotNull @Valid SaleItemRequest> items) {
}
