package com.shoestore.inventory.sale.domain.model;

import com.shoestore.inventory.sale.domain.exception.InvalidSaleException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Sale {
	private static final BigDecimal EXCLUSIVE_AMOUNT_LIMIT = BigDecimal.TEN.pow(36);

	private Long id;
	private Long userId;
	private Long customerId;
	private String customerName;
	private String customerPhone;
	private BigDecimal total;
	private PaymentType paymentType;
	private SaleStatus status;
	private List<SaleItem> items = new ArrayList<>();
	private LocalDateTime createdAt;

	public Sale() {
	}

	public void recalculateAmounts() {
		if (items == null || items.isEmpty() || paymentType == null) {
			throw new InvalidSaleException("La venta requiere al menos una línea y un medio de pago.");
		}
		BigDecimal calculatedTotal = BigDecimal.ZERO.setScale(2);
		for (SaleItem item : items) {
			if (item == null || item.getVariantId() == null || item.getQuantity() == null
					|| item.getQuantity() <= 0 || item.getUnitPrice() == null || item.getUnitPrice().signum() <= 0) {
				throw new InvalidSaleException("La venta contiene una variante, cantidad o precio inválido.");
			}
			BigDecimal price = item.getUnitPrice().stripTrailingZeros();
			if (price.scale() > 2) {
				throw new InvalidSaleException("El precio unitario admite hasta dos decimales.");
			}
			validateAmountRange(price);
			price = price.setScale(2, RoundingMode.UNNECESSARY);
			item.setUnitPrice(price);
			BigDecimal subtotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));
			item.setSubtotal(subtotal);
			calculatedTotal = calculatedTotal.add(subtotal);
		}
		validateAmountRange(calculatedTotal);
		total = calculatedTotal;
	}

	private static void validateAmountRange(BigDecimal amount) {
		if (amount.compareTo(EXCLUSIVE_AMOUNT_LIMIT) >= 0) {
			throw new InvalidSaleException("El importe supera el rango de almacenamiento.");
		}
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public Long getCustomerId() {
		return customerId;
	}

	public void setCustomerId(Long customerId) {
		this.customerId = customerId;
	}

	public String getCustomerName() {
		return customerName;
	}

	public void setCustomerName(String customerName) {
		this.customerName = customerName;
	}

	public String getCustomerPhone() {
		return customerPhone;
	}

	public void setCustomerPhone(String customerPhone) {
		this.customerPhone = customerPhone;
	}

	public BigDecimal getTotal() {
		return total;
	}

	public void setTotal(BigDecimal total) {
		this.total = total;
	}

	public PaymentType getPaymentType() {
		return paymentType;
	}

	public void setPaymentType(PaymentType paymentType) {
		this.paymentType = paymentType;
	}

	public SaleStatus getStatus() {
		return status;
	}

	public void setStatus(SaleStatus status) {
		this.status = status;
	}

	public List<SaleItem> getItems() {
		return items;
	}

	public void setItems(List<SaleItem> items) {
		this.items = items;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}
