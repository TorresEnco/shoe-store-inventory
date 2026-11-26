package com.shoestore.inventory.analytics.infrastructure.adapters.out.persistence.repository;

import com.shoestore.inventory.product.infrastructure.adapters.out.persistence.entity.ProductJpaEntity;
import com.shoestore.inventory.analytics.application.ports.out.AnalyticsRepositoryPort.StagnantVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SpringDataAnalyticsRepository extends JpaRepository<ProductJpaEntity, Long> {

	@Query(value = """
			SELECT p.id AS "productId",
			       p.name AS "productName",
			       b.name AS "brandName",
			       c.id AS "colorId",
			       c.name AS "colorName",
			       COALESCE(SUM(si.quantity), 0) AS "totalSold",
			       COALESCE(SUM(si.subtotal), 0) AS "revenue"
			FROM sale_items si
			JOIN sales s ON s.id = si.sale_id
			JOIN product_variants pv ON pv.id = si.variant_id
			JOIN products p ON p.id = pv.product_id
			LEFT JOIN brands b ON b.id = p.brand_id
			LEFT JOIN colors c ON c.id = pv.color_id
			WHERE s.created_at >= :since AND s.created_at < :until AND s.status = 'COMPLETED'
			GROUP BY p.id, p.name, b.name, c.id, c.name
			ORDER BY "revenue" DESC
			""", nativeQuery = true)
	List<ProductSalesProjection> findSalesByProductSince(@Param("since") LocalDateTime since,
			@Param("until") LocalDateTime until);

	@Query("""
			SELECT new com.shoestore.inventory.analytics.application.ports.out.AnalyticsRepositoryPort$StagnantVariant(
			    p.name, c.name, v.size, v.stock)
			FROM ProductVariantJpaEntity v JOIN v.product p LEFT JOIN v.color c
			WHERE v.createdAt < :cutoff AND v.stock > 0 AND NOT EXISTS (
			    SELECT i.id FROM SaleItemJpaEntity i JOIN i.sale s
			    WHERE i.variantId = v.id AND s.status = 'COMPLETED'
			        AND s.createdAt >= :cutoff AND s.createdAt < :until)
			ORDER BY p.id, c.id, v.size, v.id
			""")
	List<StagnantVariant> findStagnantVariants(@Param("cutoff") LocalDateTime cutoff,
			@Param("until") LocalDateTime until);
}
