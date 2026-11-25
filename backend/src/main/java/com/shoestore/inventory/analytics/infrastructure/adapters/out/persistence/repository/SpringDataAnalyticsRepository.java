package com.shoestore.inventory.analytics.infrastructure.adapters.out.persistence.repository;

import com.shoestore.inventory.product.infrastructure.adapters.out.persistence.entity.ProductJpaEntity;
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
			WHERE s.created_at >= :since AND s.status = 'COMPLETED'
			GROUP BY p.id, p.name, b.name, c.id, c.name
			ORDER BY "revenue" DESC
			""", nativeQuery = true)
	List<ProductSalesProjection> findSalesByProductSince(@Param("since") LocalDateTime since);

	@Query("SELECT p FROM ProductJpaEntity p WHERE p.createdAt < :cutoff")
	List<ProductJpaEntity> findProductsCreatedBefore(@Param("cutoff") LocalDateTime cutoff);
}
