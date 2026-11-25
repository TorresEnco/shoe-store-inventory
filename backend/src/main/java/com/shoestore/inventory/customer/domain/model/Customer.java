package com.shoestore.inventory.customer.domain.model;

import java.time.LocalDateTime;

public class Customer {

	private Long id;
	private String name;
	private String phone;
	private Integer totalPurchases;
	private LocalDateTime createdAt;

	public Customer() {
	}

	public Customer(Long id, String name, String phone, Integer totalPurchases, LocalDateTime createdAt) {
		this.id = id;
		this.name = name;
		this.phone = phone;
		this.totalPurchases = totalPurchases;
		this.createdAt = createdAt;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public Integer getTotalPurchases() {
		return totalPurchases;
	}

	public void setTotalPurchases(Integer totalPurchases) {
		this.totalPurchases = totalPurchases;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}
