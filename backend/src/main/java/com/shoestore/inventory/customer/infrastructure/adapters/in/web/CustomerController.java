package com.shoestore.inventory.customer.infrastructure.adapters.in.web;

import com.shoestore.inventory.customer.application.ports.in.CustomerUseCase;
import com.shoestore.inventory.customer.infrastructure.adapters.in.web.dto.CustomerResponse;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerController {

	private final CustomerUseCase customerUseCase;

	public CustomerController(CustomerUseCase customerUseCase) {
		this.customerUseCase = customerUseCase;
	}

	@GetMapping("/search")
	public List<CustomerResponse> searchCustomers(@RequestParam("q") String query) {
		return customerUseCase.searchCustomers(query).stream()
				.map(CustomerResponse::from)
				.toList();
	}

	@GetMapping
	public List<CustomerResponse> getAllCustomers() {
		return customerUseCase.getAllCustomers().stream()
				.map(CustomerResponse::from)
				.toList();
	}
}
