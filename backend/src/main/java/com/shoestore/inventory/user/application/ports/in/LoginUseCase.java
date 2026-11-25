package com.shoestore.inventory.user.application.ports.in;

import com.shoestore.inventory.user.domain.model.User;

public interface LoginUseCase {

	User login(String username, String rawPassword);
}
