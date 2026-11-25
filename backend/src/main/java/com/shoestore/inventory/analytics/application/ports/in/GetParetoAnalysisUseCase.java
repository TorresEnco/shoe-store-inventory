package com.shoestore.inventory.analytics.application.ports.in;

import com.shoestore.inventory.analytics.domain.model.ParetoReport;

public interface GetParetoAnalysisUseCase {

	ParetoReport getParetoReport(int days);
}
