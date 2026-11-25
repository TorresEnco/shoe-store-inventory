package com.shoestore.inventory.product.infrastructure.adapters.out.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@org.hibernate.annotations.DynamicUpdate
@Table(name = "product_variants")
public class ProductVariantJpaEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "product_id")
	private ProductJpaEntity product;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "color_id")
	private ColorJpaEntity color;

	@Column(name = "size")
	private Integer size;

	@Column(name = "catalog_price")
	private BigDecimal catalogPrice;

	@Column(name = "stock")
	private Integer stock;

	@Column(name = "created_at")
	private LocalDateTime createdAt;

	public ProductVariantJpaEntity() {
	}

	@PrePersist
	void onCreate() {
		if (createdAt == null) {
			createdAt = LocalDateTime.now();
		}
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public ProductJpaEntity getProduct() {
		return product;
	}

	public void setProduct(ProductJpaEntity product) {
		this.product = product;
	}

	public ColorJpaEntity getColor() {
		return color;
	}

	public void setColor(ColorJpaEntity color) {
		this.color = color;
	}

	public Integer getSize() {
		return size;
	}

	public void setSize(Integer size) {
		this.size = size;
	}

	public BigDecimal getCatalogPrice() {
		return catalogPrice;
	}

	public void setCatalogPrice(BigDecimal catalogPrice) {
		this.catalogPrice = catalogPrice;
	}

	public Integer getStock() {
		return stock;
	}

	public void setStock(Integer stock) {
		this.stock = stock;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}
