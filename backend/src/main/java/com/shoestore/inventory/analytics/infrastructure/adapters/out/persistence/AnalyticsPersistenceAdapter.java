package com.shoestore.inventory.analytics.infrastructure.adapters.out.persistence;

import com.shoestore.inventory.analytics.application.ports.out.AnalyticsRepositoryPort;
import com.shoestore.inventory.analytics.infrastructure.adapters.out.persistence.repository.ProductSalesProjection;
import com.shoestore.inventory.analytics.infrastructure.adapters.out.persistence.repository.SpringDataAnalyticsRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AnalyticsPersistenceAdapter implements AnalyticsRepositoryPort {

	private final SpringDataAnalyticsRepository analyticsRepository;

	public AnalyticsPersistenceAdapter(SpringDataAnalyticsRepository analyticsRepository) {
		this.analyticsRepository = analyticsRepository;
	}

	@Override
	public List<ProductSalesAggregate> findSalesByProductSince(LocalDateTime since, LocalDateTime until) {
		return analyticsRepository.findSalesByProductSince(since, until).stream()
				.map(this::toAggregate)
				.toList();
	}

	@Override
	public List<StagnantVariant> findStagnantVariants(LocalDateTime cutoff, LocalDateTime until) {
		return analyticsRepository.findStagnantVariants(cutoff, until);
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
