package com.shoestore.inventory.user.application.ports.in;

import com.shoestore.inventory.user.domain.model.User;

import java.util.List;

public interface UserManagementUseCase {

	List<User> getAllUsers();

	User createUser(User user);

	void createFirstAdmin(String username, String fullName, String password);

	User toggleUserStatus(Long userId, Long currentUserId);
}
