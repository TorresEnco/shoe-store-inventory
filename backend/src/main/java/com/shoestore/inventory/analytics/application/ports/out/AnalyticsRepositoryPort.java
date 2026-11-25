package com.shoestore.inventory.analytics.application.ports.out;

import com.shoestore.inventory.product.domain.model.Product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface AnalyticsRepositoryPort {

	List<ProductSalesAggregate> findSalesByProductSince(LocalDateTime since);

	List<Product> findProductsCreatedBefore(LocalDateTime cutoff);

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
