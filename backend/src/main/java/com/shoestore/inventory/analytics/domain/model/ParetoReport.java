package com.shoestore.inventory.analytics.domain.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ParetoReport {

	private int periodDays;
	private int totalSold;
	private BigDecimal totalRevenue;
	private int atRiskPairs;
	private double classAPercentage;
	private List<ModelRotationMetric> models = new ArrayList<>();
	private List<String> liquidationSuggestions = new ArrayList<>();

	public ParetoReport() {
	}

	public ParetoReport(int periodDays, int totalSold, BigDecimal totalRevenue, int atRiskPairs,
			double classAPercentage, List<ModelRotationMetric> models, List<String> liquidationSuggestions) {
		this.periodDays = periodDays;
		this.totalSold = totalSold;
		this.totalRevenue = totalRevenue;
		this.atRiskPairs = atRiskPairs;
		this.classAPercentage = classAPercentage;
		this.models = models;
		this.liquidationSuggestions = liquidationSuggestions;
	}

	public int getPeriodDays() {
		return periodDays;
	}

	public void setPeriodDays(int periodDays) {
		this.periodDays = periodDays;
	}

	public int getTotalSold() {
		return totalSold;
	}

	public void setTotalSold(int totalSold) {
		this.totalSold = totalSold;
	}

	public BigDecimal getTotalRevenue() {
		return totalRevenue;
	}

	public void setTotalRevenue(BigDecimal totalRevenue) {
		this.totalRevenue = totalRevenue;
	}

	public int getAtRiskPairs() {
		return atRiskPairs;
	}

	public void setAtRiskPairs(int atRiskPairs) {
		this.atRiskPairs = atRiskPairs;
	}

	public double getClassAPercentage() {
		return classAPercentage;
	}

	public void setClassAPercentage(double classAPercentage) {
		this.classAPercentage = classAPercentage;
	}

	public List<ModelRotationMetric> getModels() {
		return models;
	}

	public void setModels(List<ModelRotationMetric> models) {
		this.models = models;
	}

	public List<String> getLiquidationSuggestions() {
		return liquidationSuggestions;
	}

	public void setLiquidationSuggestions(List<String> liquidationSuggestions) {
		this.liquidationSuggestions = liquidationSuggestions;
	}
}
