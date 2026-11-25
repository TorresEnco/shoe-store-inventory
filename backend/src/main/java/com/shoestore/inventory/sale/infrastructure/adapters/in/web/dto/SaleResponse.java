package com.shoestore.inventory.sale.infrastructure.adapters.in.web.dto;

import com.shoestore.inventory.sale.domain.model.PaymentType;
import com.shoestore.inventory.sale.domain.model.Sale;
import com.shoestore.inventory.sale.domain.model.SaleItem;
import com.shoestore.inventory.sale.domain.model.SaleStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record SaleResponse(
		Long id,
		Long userId,
		String customerName,
		BigDecimal total,
		PaymentType paymentType,
		SaleStatus status,
		LocalDateTime createdAt,
		List<SaleItemResponse> items) {

	public static SaleResponse from(Sale sale) {
		return new SaleResponse(
				sale.getId(),
				sale.getUserId(),
				sale.getCustomerName(),
				sale.getTotal(),
				sale.getPaymentType(),
				sale.getStatus(),
				sale.getCreatedAt(),
				sale.getItems() == null
						? List.of()
						: sale.getItems().stream().map(SaleItemResponse::from).toList());
	}

	public record SaleItemResponse(
			Long id,
			Long variantId,
			BigDecimal unitPrice,
			Integer quantity,
			BigDecimal subtotal) {

		public static SaleItemResponse from(SaleItem item) {
			return new SaleItemResponse(
					item.getId(),
					item.getVariantId(),
					item.getUnitPrice(),
					item.getQuantity(),
					item.getSubtotal());
		}
	}
}
