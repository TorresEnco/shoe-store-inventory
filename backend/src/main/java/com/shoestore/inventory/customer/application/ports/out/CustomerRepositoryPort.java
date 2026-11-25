package com.shoestore.inventory.customer.application.ports.out;

import com.shoestore.inventory.customer.domain.model.Customer;

import java.util.List;
import java.util.Optional;

public interface CustomerRepositoryPort {

	List<Customer> findByNameOrPhone(String query);

	Optional<Customer> findById(Long id);

	Customer save(Customer customer);

	List<Customer> findAllWithMetrics();
}
