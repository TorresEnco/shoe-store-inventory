package com.shoestore.inventory.user.infrastructure.adapters.out.persistence.mapper;

import com.shoestore.inventory.user.domain.model.User;
import com.shoestore.inventory.user.infrastructure.adapters.out.persistence.entity.UserJpaEntity;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

	public User toDomain(UserJpaEntity entity) {
		if (entity == null) {
			return null;
		}
		return new User(
				entity.getId(),
				entity.getFullName(),
				entity.getUsername(),
				entity.getPassword(),
				entity.getRole(),
				entity.getActive(),
				entity.getCreatedAt());
	}

	public UserJpaEntity toEntity(User user) {
		if (user == null) {
			return null;
		}
		UserJpaEntity entity = new UserJpaEntity();
		entity.setId(user.getId());
		entity.setFullName(user.getFullName());
		entity.setUsername(user.getUsername());
		entity.setPassword(user.getPassword());
		entity.setRole(user.getRole());
		entity.setActive(user.getActive());
		entity.setCreatedAt(user.getCreatedAt());
		return entity;
	}
}
