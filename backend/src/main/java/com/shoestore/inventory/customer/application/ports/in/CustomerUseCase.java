package com.shoestore.inventory.customer.application.ports.in;

import com.shoestore.inventory.customer.domain.model.Customer;

import java.util.List;

public interface CustomerUseCase {

	List<Customer> searchCustomers(String query);

	List<Customer> getAllCustomers();
}
