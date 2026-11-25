package com.shoestore.inventory.analytics.infrastructure.adapters.out.persistence;

import com.shoestore.inventory.analytics.application.ports.out.AnalyticsRepositoryPort;
import com.shoestore.inventory.analytics.infrastructure.adapters.out.persistence.repository.ProductSalesProjection;
import com.shoestore.inventory.analytics.infrastructure.adapters.out.persistence.repository.SpringDataAnalyticsRepository;
import com.shoestore.inventory.product.domain.model.Product;
import com.shoestore.inventory.product.infrastructure.adapters.out.persistence.mapper.ProductMapper;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AnalyticsPersistenceAdapter implements AnalyticsRepositoryPort {

	private final SpringDataAnalyticsRepository analyticsRepository;
	private final ProductMapper productMapper;

	public AnalyticsPersistenceAdapter(SpringDataAnalyticsRepository analyticsRepository,
			ProductMapper productMapper) {
		this.analyticsRepository = analyticsRepository;
		this.productMapper = productMapper;
	}

	@Override
	public List<ProductSalesAggregate> findSalesByProductSince(LocalDateTime since) {
		return analyticsRepository.findSalesByProductSince(since).stream()
				.map(this::toAggregate)
				.toList();
	}

	@Override
	public List<Product> findProductsCreatedBefore(LocalDateTime cutoff) {
		return analyticsRepository.findProductsCreatedBefore(cutoff).stream()
				.map(productMapper::toDomain)
				.toList();
	}

	private ProductSalesAggregate toAggregate(ProductSalesProjection projection) {
		return new ProductSalesAggregate(
				projection.getProductId(),
				projection.getProductName(),
				projection.getBrandName(),
				projection.getColorId(),
				projection.getColorName(),
				projection.getTotalSold() == null ? 0 : projection.getTotalSold().intValue(),
				projection.getRevenue());
	}
}
