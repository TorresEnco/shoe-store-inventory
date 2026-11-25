package com.shoestore.inventory.analytics.infrastructure.adapters.out.persistence.repository;

import java.math.BigDecimal;

public interface ProductSalesProjection {

	Long getProductId();

	String getProductName();

	String getBrandName();

	Long getColorId();

	String getColorName();

	Long getTotalSold();

	BigDecimal getRevenue();
}
