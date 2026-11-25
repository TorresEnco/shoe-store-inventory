package com.shoestore.inventory.customer.infrastructure.adapters.out.persistence.mapper;

import com.shoestore.inventory.customer.domain.model.Customer;
import com.shoestore.inventory.customer.infrastructure.adapters.out.persistence.entity.CustomerJpaEntity;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

	public Customer toDomain(CustomerJpaEntity entity) {
		if (entity == null) {
			return null;
		}
		return new Customer(
				entity.getId(),
				entity.getName(),
				entity.getPhone(),
				entity.getTotalPurchases(),
				entity.getCreatedAt());
	}

	public CustomerJpaEntity toEntity(Customer customer) {
		if (customer == null) {
			return null;
		}
		CustomerJpaEntity entity = new CustomerJpaEntity();
		entity.setId(customer.getId());
		entity.setName(customer.getName());
		entity.setPhone(customer.getPhone());
		entity.setTotalPurchases(customer.getTotalPurchases());
		entity.setCreatedAt(customer.getCreatedAt());
		return entity;
	}
}
