package com.shoestore.inventory.analytics.application.service;

import com.shoestore.inventory.analytics.application.ports.in.GetParetoAnalysisUseCase;
import com.shoestore.inventory.analytics.application.ports.out.AnalyticsRepositoryPort;
import com.shoestore.inventory.analytics.application.ports.out.AnalyticsRepositoryPort.ProductSalesAggregate;
import com.shoestore.inventory.analytics.domain.model.AbcClassification;
import com.shoestore.inventory.analytics.domain.model.ModelRotationMetric;
import com.shoestore.inventory.analytics.domain.model.ParetoReport;
import com.shoestore.inventory.product.application.ports.out.ProductRepositoryPort;
import com.shoestore.inventory.product.domain.model.Product;
import com.shoestore.inventory.product.domain.model.ProductVariant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@Transactional(readOnly = true)
public class AnalyticsService implements GetParetoAnalysisUseCase {

	private static final int DEAD_STOCK_AGE_DAYS = 45;
	private static final int NEAR_ZERO_SALES = 1;

	private final AnalyticsRepositoryPort analyticsRepositoryPort;
	private final ProductRepositoryPort productRepositoryPort;

	public AnalyticsService(AnalyticsRepositoryPort analyticsRepositoryPort,
			ProductRepositoryPort productRepositoryPort) {
		this.analyticsRepositoryPort = analyticsRepositoryPort;
		this.productRepositoryPort = productRepositoryPort;
	}

	@Override
	public ParetoReport getParetoReport(int days) {
		int periodDays = Math.max(days, 1);
		LocalDateTime now = LocalDateTime.now();

		List<ProductSalesAggregate> aggregates = analyticsRepositoryPort
				.findSalesByProductSince(now.minusDays(periodDays));
		List<Product> products = productRepositoryPort.findAll();

		Map<Long, Product> productsById = new HashMap<>();
		for (Product product : products) {
			if (product.getId() != null) {
				productsById.put(product.getId(), product);
			}
		}

		int totalSold = 0;
		BigDecimal totalRevenue = BigDecimal.ZERO;
		for (ProductSalesAggregate aggregate : aggregates) {
			totalSold += safe(aggregate.totalSold());
			totalRevenue = totalRevenue.add(revenueOf(aggregate));
		}

		List<ProductSalesAggregate> sorted = new ArrayList<>(aggregates);
		sorted.sort(Comparator.comparing(this::revenueOf).reversed());

		List<ModelRotationMetric> models = new ArrayList<>();
		BigDecimal cumulativeRevenue = BigDecimal.ZERO;
		for (ProductSalesAggregate aggregate : sorted) {
			Product product = productsById.get(aggregate.productId());
			if (product == null) {
				continue;
			}

			BigDecimal revenue = revenueOf(aggregate);
			cumulativeRevenue = cumulativeRevenue.add(revenue);
			double cumulativePercentage = totalRevenue.signum() == 0
					? 100.0
					: cumulativeRevenue
							.divide(totalRevenue, 4, RoundingMode.HALF_UP)
							.doubleValue() * 100.0;
			AbcClassification classification = classify(totalRevenue, cumulativePercentage);

			int sold = safe(aggregate.totalSold());
			int stock = currentStock(product, aggregate.colorId());
			double velocity = Math.round((sold / (double) periodDays) * 10.0) / 10.0;

			models.add(new ModelRotationMetric(
					aggregate.productId(),
					aggregate.productName(),
					aggregate.brandName(),
					aggregate.colorName(),
					sold,
					revenue,
					velocity,
					stock,
					classification,
					stockStatus(classification, stock, sold),
					sizeBreakdown(product, aggregate.colorId())));
		}

		int atRiskPairs = 0;
		BigDecimal classARevenue = BigDecimal.ZERO;
		for (ModelRotationMetric model : models) {
			if (!"Rotación saludable".equals(model.getStockStatus())) {
				atRiskPairs++;
			}
			if (model.getClassification() == AbcClassification.CLASS_A) {
				classARevenue = classARevenue.add(model.getRevenue());
			}
		}
		double classAPercentage = totalRevenue.signum() == 0
				? 0.0
				: roundOne(classARevenue
						.divide(totalRevenue, 4, RoundingMode.HALF_UP)
						.doubleValue() * 100.0);

		List<String> liquidationSuggestions = buildLiquidationSuggestions(
				now.minusDays(DEAD_STOCK_AGE_DAYS), aggregates);

		return new ParetoReport(periodDays, totalSold, totalRevenue, atRiskPairs, classAPercentage,
				models, liquidationSuggestions);
	}

	private AbcClassification classify(BigDecimal totalRevenue, double cumulativePercentage) {
		if (totalRevenue.signum() == 0) {
			return AbcClassification.CLASS_C;
		}
		if (cumulativePercentage <= 80.0) {
			return AbcClassification.CLASS_A;
		}
		if (cumulativePercentage <= 95.0) {
			return AbcClassification.CLASS_B;
		}
		return AbcClassification.CLASS_C;
	}

	private String stockStatus(AbcClassification classification, int stock, int sold) {
		if (stock <= 0) {
			return "Stock crítico";
		}
		if (classification == AbcClassification.CLASS_A && stock < 5) {
			return "Reponer pronto";
		}
		if (stock < sold) {
			return "Reponer pronto";
		}
		return "Rotación saludable";
	}

	private List<String> buildLiquidationSuggestions(LocalDateTime cutoff,
			List<ProductSalesAggregate> aggregates) {
		Map<Long, Integer> soldByProduct = new HashMap<>();
		for (ProductSalesAggregate aggregate : aggregates) {
			soldByProduct.merge(aggregate.productId(), safe(aggregate.totalSold()), Integer::sum);
		}

		List<String> suggestions = new ArrayList<>();
		for (Product product : analyticsRepositoryPort.findProductsCreatedBefore(cutoff)) {
			int sold = soldByProduct.getOrDefault(product.getId(), 0);
			int stock = totalStock(product);
			if (sold <= NEAR_ZERO_SALES && stock > 0) {
				suggestions.add("Liquidar " + product.getName() + ": " + stock + " pares sin rotación");
			}
		}
		return suggestions;
	}

	private int currentStock(Product product, Long colorId) {
		int total = 0;
		if (product.getVariants() == null) {
			return total;
		}
		for (ProductVariant variant : product.getVariants()) {
			if (matchesColor(variant, colorId)) {
				total += safe(variant.getStock());
			}
		}
		return total;
	}

	private Map<Integer, Integer> sizeBreakdown(Product product, Long colorId) {
		Map<Integer, Integer> breakdown = new LinkedHashMap<>();
		if (product.getVariants() == null) {
			return breakdown;
		}
		for (ProductVariant variant : product.getVariants()) {
			if (matchesColor(variant, colorId) && variant.getSize() != null) {
				breakdown.merge(variant.getSize(), safe(variant.getStock()), Integer::sum);
			}
		}
		return breakdown;
	}

	private int totalStock(Product product) {
		int total = 0;
		if (product.getVariants() == null) {
			return total;
		}
		for (ProductVariant variant : product.getVariants()) {
			total += safe(variant.getStock());
		}
		return total;
	}

	private boolean matchesColor(ProductVariant variant, Long colorId) {
		Long variantColorId = variant.getColor() == null ? null : variant.getColor().getId();
		return Objects.equals(variantColorId, colorId);
	}

	private BigDecimal revenueOf(ProductSalesAggregate aggregate) {
		return aggregate.revenue() == null ? BigDecimal.ZERO : aggregate.revenue();
	}

	private int safe(Integer value) {
		return value == null ? 0 : value;
	}

	private double roundOne(double value) {
		return Math.round(value * 10.0) / 10.0;
	}
}
