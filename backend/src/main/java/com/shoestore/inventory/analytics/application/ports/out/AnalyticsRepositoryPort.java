package com.shoestore.inventory.analytics.application.ports.out;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface AnalyticsRepositoryPort {

	List<ProductSalesAggregate> findSalesByProductSince(LocalDateTime since, LocalDateTime until);

	List<StagnantVariant> findStagnantVariants(LocalDateTime cutoff, LocalDateTime until);

	record StagnantVariant(String productName, String colorName, Integer size, int stock) {}

	record ProductSalesAggregate(
			Long productId,
			String productName,
			String brandName,
			Long colorId,
			String colorName,
			Integer totalSold,
			BigDecimal revenue) {
	}
}
