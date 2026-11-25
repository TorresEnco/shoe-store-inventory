package com.shoestore.inventory.customer.application.service;

import com.shoestore.inventory.customer.application.ports.in.CustomerUseCase;
import com.shoestore.inventory.customer.application.ports.out.CustomerRepositoryPort;
import com.shoestore.inventory.customer.domain.model.Customer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CustomerService implements CustomerUseCase {

	private final CustomerRepositoryPort customerRepositoryPort;

	public CustomerService(CustomerRepositoryPort customerRepositoryPort) {
		this.customerRepositoryPort = customerRepositoryPort;
	}

	@Override
	public List<Customer> searchCustomers(String query) {
		if (query == null || query.isBlank()) {
			return List.of();
		}
		return customerRepositoryPort.findByNameOrPhone(query.trim());
	}

	@Override
	public List<Customer> getAllCustomers() {
		return customerRepositoryPort.findAllWithMetrics();
	}
}
