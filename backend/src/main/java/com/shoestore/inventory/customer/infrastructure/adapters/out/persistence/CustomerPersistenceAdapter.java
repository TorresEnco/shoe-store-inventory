package com.shoestore.inventory.customer.infrastructure.adapters.out.persistence;

import com.shoestore.inventory.customer.application.ports.out.CustomerRepositoryPort;
import com.shoestore.inventory.customer.domain.model.Customer;
import com.shoestore.inventory.customer.infrastructure.adapters.out.persistence.mapper.CustomerMapper;
import com.shoestore.inventory.customer.infrastructure.adapters.out.persistence.repository.SpringDataCustomerRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class CustomerPersistenceAdapter implements CustomerRepositoryPort {

	private final SpringDataCustomerRepository customerRepository;
	private final CustomerMapper mapper;

	public CustomerPersistenceAdapter(SpringDataCustomerRepository customerRepository, CustomerMapper mapper) {
		this.customerRepository = customerRepository;
		this.mapper = mapper;
	}

	@Override
	public List<Customer> findByNameOrPhone(String query) {
		return customerRepository
				.findByNameContainingIgnoreCaseOrPhoneContainingIgnoreCase(query, query).stream()
				.map(mapper::toDomain)
				.toList();
	}

	@Override
	public Optional<Customer> findById(Long id) {
		return customerRepository.findById(id).map(mapper::toDomain);
	}

	@Override
	public Customer save(Customer customer) {
		return mapper.toDomain(customerRepository.save(mapper.toEntity(customer)));
	}

	@Override
	public List<Customer> findAllWithMetrics() {
		return customerRepository.findAllByOrderByNameAsc().stream()
				.map(mapper::toDomain)
				.toList();
	}
}
