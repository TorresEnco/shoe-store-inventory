package com.shoestore.inventory.customer.infrastructure.adapters.in.web.dto;

import com.shoestore.inventory.customer.domain.model.Customer;

import java.time.LocalDateTime;

public record CustomerResponse(
		Long id,
		String name,
		String phone,
		Integer totalPurchases,
		LocalDateTime createdAt) {

	public static CustomerResponse from(Customer customer) {
		return new CustomerResponse(
				customer.getId(),
				customer.getName(),
				customer.getPhone(),
				customer.getTotalPurchases(),
				customer.getCreatedAt());
	}
}
