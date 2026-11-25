package com.shoestore.inventory.analytics.infrastructure.adapters.in.web;

import com.shoestore.inventory.analytics.application.ports.in.GetParetoAnalysisUseCase;
import com.shoestore.inventory.analytics.domain.model.ParetoReport;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyticsController {

	private final GetParetoAnalysisUseCase getParetoAnalysisUseCase;

	public AnalyticsController(GetParetoAnalysisUseCase getParetoAnalysisUseCase) {
		this.getParetoAnalysisUseCase = getParetoAnalysisUseCase;
	}

	@GetMapping("/pareto")
	public ParetoReport getParetoReport(@RequestParam(defaultValue = "30") int days) {
		return getParetoAnalysisUseCase.getParetoReport(days);
	}
}
