package com.shoestore.inventory.sale.domain.model;

import java.math.BigDecimal;

public class SaleItem {

	private Long id;
	private Long variantId;
	private BigDecimal unitPrice;
	private Integer quantity;
	private BigDecimal subtotal;

	public SaleItem() {
	}

	public SaleItem(Long id, Long variantId, BigDecimal unitPrice, Integer quantity, BigDecimal subtotal) {
		this.id = id;
		this.variantId = variantId;
		this.unitPrice = unitPrice;
		this.quantity = quantity;
		this.subtotal = subtotal;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getVariantId() {
		return variantId;
	}

	public void setVariantId(Long variantId) {
		this.variantId = variantId;
	}

	public BigDecimal getUnitPrice() {
		return unitPrice;
	}

	public void setUnitPrice(BigDecimal unitPrice) {
		this.unitPrice = unitPrice;
	}

	public Integer getQuantity() {
		return quantity;
	}

	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}

	public BigDecimal getSubtotal() {
		return subtotal;
	}

	public void setSubtotal(BigDecimal subtotal) {
		this.subtotal = subtotal;
	}
}
