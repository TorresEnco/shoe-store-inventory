package com.shoestore.inventory.analytics.application.service;

import com.shoestore.inventory.analytics.application.ports.out.AnalyticsRepositoryPort;
import com.shoestore.inventory.analytics.application.ports.out.AnalyticsRepositoryPort.ProductSalesAggregate;
import com.shoestore.inventory.analytics.application.ports.out.AnalyticsRepositoryPort.StagnantVariant;
import com.shoestore.inventory.analytics.domain.model.AbcClassification;
import com.shoestore.inventory.product.application.ports.out.ProductRepositoryPort;
import com.shoestore.inventory.product.domain.model.Product;
import com.shoestore.inventory.product.domain.model.ProductVariant;
import com.shoestore.inventory.product.domain.model.Color;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AnalyticsServiceTests {
    private final AnalyticsRepositoryPort analytics = mock(AnalyticsRepositoryPort.class);
    private final ProductRepositoryPort products = mock(ProductRepositoryPort.class);
    private final Clock clock = Clock.fixed(Instant.parse("2026-11-26T12:00:00Z"), ZoneOffset.UTC);
    private final LocalDateTime now = LocalDateTime.now(clock);
    private final AnalyticsService service = new AnalyticsService(analytics, products, clock);

    private ProductSalesAggregate row(long product, Long color, String revenue) {
        return new ProductSalesAggregate(product, "Modelo " + product, null, color, "Negro", 1, new BigDecimal(revenue));
    }

    private List<AbcClassification> classes(ProductSalesAggregate... rows) {
        when(analytics.findSalesByProductSince(now.minusDays(30), now)).thenReturn(List.of(rows));
        return service.getParetoReport(30).getModels().stream().map(model -> model.getClassification()).toList();
    }

    @Test void oneGroupWithAllRevenueIsA() {
        assertEquals(List.of(AbcClassification.CLASS_A), classes(row(1, 1L, "100")));
        assertEquals(100.0, service.getParetoReport(30).getClassAPercentage());
    }

    @Test void crossingGroupsCompleteTheirClasses() {
        assertEquals(List.of(AbcClassification.CLASS_A, AbcClassification.CLASS_A,
                AbcClassification.CLASS_B, AbcClassification.CLASS_C),
                classes(row(1, 1L, "70"), row(2, 1L, "20"), row(3, 1L, "6"), row(4, 1L, "4")));
    }

    @Test void exactThresholdStartsTheNextClass() {
        assertEquals(List.of(AbcClassification.CLASS_A, AbcClassification.CLASS_B, AbcClassification.CLASS_C),
                classes(row(1, 1L, "80"), row(2, 1L, "15"), row(3, 1L, "5")));
    }

    @Test void comparisonsDoNotRoundBeforeClassifying() {
        assertEquals(List.of(AbcClassification.CLASS_A, AbcClassification.CLASS_A,
                AbcClassification.CLASS_B, AbcClassification.CLASS_C),
                classes(row(1, 1L, "799999"), row(2, 1L, "150000"), row(3, 1L, "50000"), row(4, 1L, "1")));
        // Sorted revenues: 799999, 150000, 50000, 1; accumulated before the third is 94.9999%.
    }

    @Test void tiesUseProductAndColorIdsIncludingNoColor() {
        classes(row(2, 1L, "10"), row(1, 2L, "10"), row(1, null, "10"), row(1, 1L, "10"));
        var models = service.getParetoReport(30).getModels();
        assertEquals(List.of(1L, 1L, 1L, 2L), models.stream().map(model -> model.getProductId()).toList());
        assertNull(models.getFirst().getColorId());
        assertEquals(1L, models.get(1).getColorId());
        assertEquals(2L, models.get(2).getColorId());
    }

    @Test void zeroRevenueAndEmptyPeriodAreSafe() {
        assertEquals(List.of(AbcClassification.CLASS_C), classes(row(1, 1L, "0")));
        assertEquals(0.0, service.getParetoReport(30).getClassAPercentage());
        assertTrue(service.getParetoReport(7).getModels().isEmpty());
    }

    @Test void riskCountsPairsAndAlwaysUses45Days() {
        when(analytics.findStagnantVariants(now.minusDays(45), now)).thenReturn(List.of(
                new StagnantVariant("Antiguo", "Negro", 40, 7),
                new StagnantVariant("Antiguo", "Blanco", 41, 3)));
        var shortPeriod = service.getParetoReport(7);
        var longPeriod = service.getParetoReport(90);
        assertEquals(10, shortPeriod.getAtRiskPairs());
        assertEquals(10, longPeriod.getAtRiskPairs());
        assertEquals(shortPeriod.getLiquidationSuggestions(), longPeriod.getLiquidationSuggestions());
        assertTrue(shortPeriod.getLiquidationSuggestions().getFirst().contains("talla 40: 7 pares"));
        verify(analytics, times(2)).findStagnantVariants(now.minusDays(45), now);
    }

    @Test void invalidPeriodsDoNotQueryStorage() {
        assertThrows(IllegalArgumentException.class, () -> service.getParetoReport(0));
        assertThrows(IllegalArgumentException.class, () -> service.getParetoReport(366));
        verifyNoInteractions(analytics, products);
    }

    @Test void stockAndSizesBelongToTheReportedColor() {
        Product product = new Product();
        product.setId(1L);
        product.setVariants(List.of(
                new ProductVariant(1L, 1L, new Color(1L, "Negro"), 40, BigDecimal.TEN, 3, now),
                new ProductVariant(2L, 1L, new Color(1L, "Negro"), 39, BigDecimal.TEN, 4, now),
                new ProductVariant(3L, 1L, new Color(2L, "Blanco"), 40, BigDecimal.TEN, 99, now)));
        when(products.findAll()).thenReturn(List.of(product));
        classes(row(1, 1L, "10"));
        var model = service.getParetoReport(30).getModels().getFirst();
        assertEquals(7, model.getCurrentStock());
        assertEquals(List.of(39, 40), model.getSizeBreakdown().keySet().stream().toList());
        assertEquals(0.0, model.getVelocityPerDay());
    }
}
