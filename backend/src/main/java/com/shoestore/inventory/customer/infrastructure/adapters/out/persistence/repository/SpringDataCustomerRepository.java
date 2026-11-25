package com.shoestore.inventory.customer.infrastructure.adapters.out.persistence.repository;

import com.shoestore.inventory.customer.infrastructure.adapters.out.persistence.entity.CustomerJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpringDataCustomerRepository extends JpaRepository<CustomerJpaEntity, Long> {

	List<CustomerJpaEntity> findByNameContainingIgnoreCaseOrPhoneContainingIgnoreCase(String name, String phone);

	List<CustomerJpaEntity> findAllByOrderByNameAsc();
}
