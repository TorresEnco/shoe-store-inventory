package com.shoestore.inventory.sale.infrastructure.adapters.out.persistence.mapper;

import com.shoestore.inventory.customer.infrastructure.adapters.out.persistence.entity.CustomerJpaEntity;
import com.shoestore.inventory.sale.domain.model.Sale;
import com.shoestore.inventory.sale.domain.model.SaleItem;
import com.shoestore.inventory.sale.infrastructure.adapters.out.persistence.entity.SaleItemJpaEntity;
import com.shoestore.inventory.sale.infrastructure.adapters.out.persistence.entity.SaleJpaEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class SaleMapper {

	public Sale toDomain(SaleJpaEntity entity) {
		if (entity == null) {
			return null;
		}
		Sale sale = new Sale();
		sale.setId(entity.getId());
		sale.setUserId(entity.getUserId());
		sale.setCustomerId(entity.getCustomer() == null ? null : entity.getCustomer().getId());
		sale.setCustomerName(entity.getCustomerName());
		sale.setTotal(entity.getTotal());
		sale.setPaymentType(entity.getPaymentType());
		sale.setStatus(entity.getStatus());
		sale.setCreatedAt(entity.getCreatedAt());

		List<SaleItem> items = new ArrayList<>();
		for (SaleItemJpaEntity item : entity.getItems()) {
			items.add(toItemDomain(item));
		}
		sale.setItems(items);
		return sale;
	}

	public SaleJpaEntity toEntity(Sale sale) {
		if (sale == null) {
			return null;
		}
		SaleJpaEntity entity = new SaleJpaEntity();
		entity.setId(sale.getId());
		entity.setUserId(sale.getUserId());
		if (sale.getCustomerId() != null) {
			CustomerJpaEntity customer = new CustomerJpaEntity();
			customer.setId(sale.getCustomerId());
			entity.setCustomer(customer);
		}
		entity.setCustomerName(sale.getCustomerName());
		entity.setTotal(sale.getTotal());
		entity.setPaymentType(sale.getPaymentType());
		entity.setStatus(sale.getStatus());
		entity.setCreatedAt(sale.getCreatedAt());

		List<SaleItemJpaEntity> items = new ArrayList<>();
		if (sale.getItems() != null) {
			for (SaleItem item : sale.getItems()) {
				SaleItemJpaEntity itemEntity = toItemEntity(item);
				itemEntity.setSale(entity);
				items.add(itemEntity);
			}
		}
		entity.setItems(items);
		return entity;
	}

	private SaleItem toItemDomain(SaleItemJpaEntity entity) {
		return new SaleItem(
				entity.getId(),
				entity.getVariantId(),
				entity.getUnitPrice(),
				entity.getQuantity(),
				entity.getSubtotal());
	}

	private SaleItemJpaEntity toItemEntity(SaleItem item) {
		SaleItemJpaEntity entity = new SaleItemJpaEntity();
		entity.setId(item.getId());
		entity.setVariantId(item.getVariantId());
		entity.setUnitPrice(item.getUnitPrice());
		entity.setQuantity(item.getQuantity());
		entity.setSubtotal(item.getSubtotal());
		return entity;
	}
}
