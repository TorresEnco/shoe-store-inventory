package com.shoestore.inventory.analytics.application.service;

import com.shoestore.inventory.analytics.application.ports.in.GetParetoAnalysisUseCase;
import com.shoestore.inventory.analytics.application.ports.out.AnalyticsRepositoryPort;
import com.shoestore.inventory.analytics.application.ports.out.AnalyticsRepositoryPort.ProductSalesAggregate;
import com.shoestore.inventory.analytics.domain.model.AbcClassification;
import com.shoestore.inventory.analytics.domain.model.ModelRotationMetric;
import com.shoestore.inventory.analytics.domain.model.ParetoReport;
import com.shoestore.inventory.product.application.ports.out.ProductRepositoryPort;
import com.shoestore.inventory.product.domain.model.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;

@Service
@Transactional(readOnly = true)
public class AnalyticsService implements GetParetoAnalysisUseCase {
    private final AnalyticsRepositoryPort analytics;
    private final ProductRepositoryPort products;
    private final Clock clock;

    @Autowired
    public AnalyticsService(AnalyticsRepositoryPort analytics, ProductRepositoryPort products) {
        this(analytics, products, Clock.systemDefaultZone());
    }

    AnalyticsService(AnalyticsRepositoryPort analytics, ProductRepositoryPort products, Clock clock) {
        this.analytics = analytics;
        this.products = products;
        this.clock = clock;
    }

    @Override
    public ParetoReport getParetoReport(int days) {
        if (days < 1 || days > 365) throw new IllegalArgumentException("El período debe estar entre 1 y 365 días.");
        LocalDateTime now = LocalDateTime.now(clock);
        var aggregates = analytics.findSalesByProductSince(now.minusDays(days), now);
        Map<Long, Product> catalog = new HashMap<>();
        products.findAll().forEach(product -> catalog.put(product.getId(), product));
        var sorted = new ArrayList<>(aggregates);
        sorted.sort(Comparator.comparing(ProductSalesAggregate::revenue).reversed()
                .thenComparing(ProductSalesAggregate::productId)
                .thenComparing(ProductSalesAggregate::colorId, Comparator.nullsFirst(Comparator.naturalOrder())));
        BigDecimal totalRevenue = sorted.stream().map(ProductSalesAggregate::revenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int totalSold = sorted.stream().mapToInt(ProductSalesAggregate::totalSold).sum();
        BigDecimal accumulated = BigDecimal.ZERO;
        BigDecimal classARevenue = BigDecimal.ZERO;
        List<ModelRotationMetric> models = new ArrayList<>();
        for (var aggregate : sorted) {
            // The group crossing a threshold completes the class it entered.
            var classification = classify(totalRevenue, accumulated, aggregate.revenue());
            accumulated = accumulated.add(aggregate.revenue());
            if (classification == AbcClassification.CLASS_A) classARevenue = classARevenue.add(aggregate.revenue());
            Map<Integer, Integer> sizes = new TreeMap<>();
            int stock = 0;
            var product = catalog.get(aggregate.productId());
            if (product != null && product.getVariants() != null) {
                for (var variant : product.getVariants()) {
                    if (!Objects.equals(aggregate.colorId(), variant.getColor() == null ? null : variant.getColor().getId())) continue;
                    int available = variant.getStock() == null ? 0 : variant.getStock();
                    stock += available;
                    if (variant.getSize() != null) sizes.merge(variant.getSize(), available, Integer::sum);
                }
            }
            String status = stock <= 0 ? "Stock crítico"
                    : stock < aggregate.totalSold() || classification == AbcClassification.CLASS_A && stock < 5
                    ? "Reponer pronto" : "Rotación saludable";
            models.add(new ModelRotationMetric(aggregate.productId(), aggregate.colorId(), aggregate.productName(),
                    aggregate.brandName(), aggregate.colorName(), aggregate.totalSold(), aggregate.revenue(),
                    Math.round(aggregate.totalSold() / (double) days * 10.0) / 10.0, stock, classification, status, sizes));
        }
        var stagnant = analytics.findStagnantVariants(now.minusDays(45), now);
        int atRiskPairs = stagnant.stream().mapToInt(AnalyticsRepositoryPort.StagnantVariant::stock).sum();
        var suggestions = stagnant.stream().map(variant -> variant.productName() + " · "
                + (variant.colorName() == null ? "Sin color" : variant.colorName()) + " · talla "
                + variant.size() + ": " + variant.stock() + " pares sin ventas en 45 días").toList();
        double classAPercentage = totalRevenue.signum() == 0 ? 0.0
                : classARevenue.multiply(BigDecimal.valueOf(100)).divide(totalRevenue, 1, RoundingMode.HALF_UP).doubleValue();
        return new ParetoReport(days, totalSold, totalRevenue, atRiskPairs, classAPercentage, models, suggestions);
    }

    private AbcClassification classify(BigDecimal total, BigDecimal accumulated, BigDecimal revenue) {
        if (total.signum() == 0 || revenue.signum() == 0) return AbcClassification.CLASS_C;
        BigDecimal percentageNumerator = accumulated.multiply(BigDecimal.valueOf(100));
        if (percentageNumerator.compareTo(total.multiply(BigDecimal.valueOf(80))) < 0) return AbcClassification.CLASS_A;
        if (percentageNumerator.compareTo(total.multiply(BigDecimal.valueOf(95))) < 0) return AbcClassification.CLASS_B;
        return AbcClassification.CLASS_C;
    }
}
