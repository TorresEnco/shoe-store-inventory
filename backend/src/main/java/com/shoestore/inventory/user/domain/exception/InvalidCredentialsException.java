package com.shoestore.inventory.user.domain.exception;

public class InvalidCredentialsException extends RuntimeException {

	public InvalidCredentialsException(String message) {
		super(message);
	}
}
