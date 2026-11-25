package com.shoestore.inventory.product.domain.model;

import com.shoestore.inventory.product.domain.exception.InsufficientStockException;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductVariant {

	private Long id;
	private Long productId;
	private Color color;
	private Integer size;
	private BigDecimal catalogPrice;
	private Integer stock;
	private LocalDateTime createdAt;

	public ProductVariant() {
	}

	public ProductVariant(Long id, Long productId, Color color, Integer size, BigDecimal catalogPrice,
			Integer stock, LocalDateTime createdAt) {
		this.id = id;
		this.productId = productId;
		this.color = color;
		this.size = size;
		this.catalogPrice = catalogPrice;
		this.stock = stock;
		this.createdAt = createdAt;
	}

	public void updateStock(int delta) {
		int newStock = (stock == null ? 0 : stock) + delta;
		if (newStock < 0) {
			throw new InsufficientStockException("Stock cannot be negative for variant " + id);
		}
		this.stock = newStock;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getProductId() {
		return productId;
	}

	public void setProductId(Long productId) {
		this.productId = productId;
	}

	public Color getColor() {
		return color;
	}

	public void setColor(Color color) {
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
