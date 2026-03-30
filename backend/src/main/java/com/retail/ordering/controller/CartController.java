package com.retail.ordering.controller;

import com.retail.ordering.dto.ApiResponse;
import com.retail.ordering.dto.CartItemDTO;
import com.retail.ordering.dto.CartItemRequest;
import com.retail.ordering.entity.User;
import com.retail.ordering.repository.UserRepository;
import com.retail.ordering.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    public CartController(CartService cartService, UserRepository userRepository) {
        this.cartService = cartService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<CartItemDTO>> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(cartService.getCart(user));
    }

    @PostMapping
    public ResponseEntity<CartItemDTO> addToCart(@AuthenticationPrincipal UserDetails userDetails,
                                                  @Valid @RequestBody CartItemRequest request) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(cartService.addToCart(user, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> removeFromCart(@AuthenticationPrincipal UserDetails userDetails,
                                                       @PathVariable Long id) {
        User user = getUser(userDetails);
        cartService.removeFromCart(user, id);
        return ResponseEntity.ok(new ApiResponse("Item removed from cart", true));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
