package com.shoestore.inventory.user.infrastructure.adapters.in.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import com.shoestore.inventory.user.infrastructure.adapters.in.web.dto.LoginRequest;
import com.shoestore.inventory.user.infrastructure.adapters.in.web.dto.LoginResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Clock;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthenticationManager authentication;
	private final HttpSessionSecurityContextRepository contexts;
	private final LoginAttemptLimiter attempts = new LoginAttemptLimiter(Clock.systemUTC());

	public AuthController(AuthenticationManager authentication, HttpSessionSecurityContextRepository contexts) {
		this.authentication = authentication;
		this.contexts = contexts;
	}

	@GetMapping("/csrf")
	public CsrfToken csrf(CsrfToken token) {
		return token;
	}

	@GetMapping("/me")
	public LoginResponse currentUser(@AuthenticationPrincipal LoginResponse profile) {
		return profile;
	}

	@PostMapping("/login")
	public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest http,
			HttpServletResponse response) {
		long retryAfter = attempts.reserve(request.username(), http.getRemoteAddr());
		if (retryAfter > 0) {
			return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
					.header(HttpHeaders.RETRY_AFTER, Long.toString(retryAfter)).build();
		}
		var result = authentication.authenticate(
				UsernamePasswordAuthenticationToken.unauthenticated(request.username(), request.password()));
		// Discard the pre-login session, including its CSRF secret.
		var previous = http.getSession(false);
		if (previous != null) previous.invalidate();
		var context = SecurityContextHolder.createEmptyContext();
		context.setAuthentication(result);
		SecurityContextHolder.setContext(context);
		contexts.saveContext(context, http, response);
		return ResponseEntity.ok((LoginResponse) result.getPrincipal());
	}

	@ExceptionHandler(BadCredentialsException.class)
	public ResponseEntity<String> handleInvalidCredentials(BadCredentialsException exception) {
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(exception.getMessage());
	}
}
