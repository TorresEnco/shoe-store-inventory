package com.shoestore.inventory.analytics.domain.model;

import java.math.BigDecimal;
import java.util.Map;

public class ModelRotationMetric {

	private Long productId;
	private Long colorId;
	private String productName;
	private String brandName;
	private String colorName;
	private Integer totalSold;
	private BigDecimal revenue;
	private Double velocityPerDay;
	private Integer currentStock;
	private AbcClassification classification;
	private String stockStatus;
	private Map<Integer, Integer> sizeBreakdown;

	public ModelRotationMetric() {
	}

	public ModelRotationMetric(Long productId, Long colorId, String productName, String brandName, String colorName,
			Integer totalSold, BigDecimal revenue, Double velocityPerDay, Integer currentStock,
			AbcClassification classification, String stockStatus, Map<Integer, Integer> sizeBreakdown) {
		this.productId = productId;
		this.colorId = colorId;
		this.productName = productName;
		this.brandName = brandName;
		this.colorName = colorName;
		this.totalSold = totalSold;
		this.revenue = revenue;
		this.velocityPerDay = velocityPerDay;
		this.currentStock = currentStock;
		this.classification = classification;
		this.stockStatus = stockStatus;
		this.sizeBreakdown = sizeBreakdown;
	}

	public Long getProductId() {
		return productId;
	}

	public Long getColorId() {
		return colorId;
	}

	public void setProductId(Long productId) {
		this.productId = productId;
	}

	public String getProductName() {
		return productName;
	}

	public void setProductName(String productName) {
		this.productName = productName;
	}

	public String getBrandName() {
		return brandName;
	}

	public void setBrandName(String brandName) {
		this.brandName = brandName;
	}

	public String getColorName() {
		return colorName;
	}

	public void setColorName(String colorName) {
		this.colorName = colorName;
	}

	public Integer getTotalSold() {
		return totalSold;
	}

	public void setTotalSold(Integer totalSold) {
		this.totalSold = totalSold;
	}

	public BigDecimal getRevenue() {
		return revenue;
	}

	public void setRevenue(BigDecimal revenue) {
		this.revenue = revenue;
	}

	public Double getVelocityPerDay() {
		return velocityPerDay;
	}

	public void setVelocityPerDay(Double velocityPerDay) {
		this.velocityPerDay = velocityPerDay;
	}

	public Integer getCurrentStock() {
		return currentStock;
	}

	public void setCurrentStock(Integer currentStock) {
		this.currentStock = currentStock;
	}

	public AbcClassification getClassification() {
		return classification;
	}

	public void setClassification(AbcClassification classification) {
		this.classification = classification;
	}

	public String getStockStatus() {
		return stockStatus;
	}

	public void setStockStatus(String stockStatus) {
		this.stockStatus = stockStatus;
	}

	public Map<Integer, Integer> getSizeBreakdown() {
		return sizeBreakdown;
	}

	public void setSizeBreakdown(Map<Integer, Integer> sizeBreakdown) {
		this.sizeBreakdown = sizeBreakdown;
	}
}
