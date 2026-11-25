package com.shoestore.inventory.user.domain.model;

import java.time.LocalDateTime;

public class User {

	private Long id;
	private String fullName;
	private String username;
	private String password;
	private Role role;
	private Boolean active;
	private LocalDateTime createdAt;

	public User() {
	}

	public User(Long id, String fullName, String username, String password, Role role, Boolean active,
			LocalDateTime createdAt) {
		this.id = id;
		this.fullName = fullName;
		this.username = username;
		this.password = password;
		this.role = role;
		this.active = active;
		this.createdAt = createdAt;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	public Boolean getActive() {
		return active;
	}

	public void setActive(Boolean active) {
		this.active = active;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}
