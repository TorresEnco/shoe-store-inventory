package com.shoestore.inventory.sale.infrastructure.adapters.out.persistence.entity;

import com.shoestore.inventory.customer.infrastructure.adapters.out.persistence.entity.CustomerJpaEntity;
import com.shoestore.inventory.sale.domain.model.PaymentType;
import com.shoestore.inventory.sale.domain.model.SaleStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales")
public class SaleJpaEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "user_id")
	private Long userId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "customer_id")
	private CustomerJpaEntity customer;

	@Column(name = "customer_name")
	private String customerName;

	@Column(name = "total")
	private BigDecimal total;

	@Enumerated(EnumType.STRING)
	@Column(name = "payment_type")
	private PaymentType paymentType;

	@Enumerated(EnumType.STRING)
	@Column(name = "status")
	private SaleStatus status;

	@OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<SaleItemJpaEntity> items = new ArrayList<>();

	@Column(name = "created_at")
	private LocalDateTime createdAt;

	public SaleJpaEntity() {
	}

	@PrePersist
	void onCreate() {
		if (createdAt == null) {
			createdAt = LocalDateTime.now();
		}
	}

	public void addItem(SaleItemJpaEntity item) {
		item.setSale(this);
		this.items.add(item);
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

	public CustomerJpaEntity getCustomer() {
		return customer;
	}

	public void setCustomer(CustomerJpaEntity customer) {
		this.customer = customer;
	}

	public String getCustomerName() {
		return customerName;
	}

	public void setCustomerName(String customerName) {
		this.customerName = customerName;
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

	public List<SaleItemJpaEntity> getItems() {
		return items;
	}

	public void setItems(List<SaleItemJpaEntity> items) {
		this.items = items;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}
