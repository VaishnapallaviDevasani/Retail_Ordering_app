package com.retail.ordering.controller;

import com.retail.ordering.dto.*;
import com.retail.ordering.repository.CategoryRepository;
import com.retail.ordering.repository.OrderRepository;
import com.retail.ordering.repository.ProductRepository;
import com.retail.ordering.repository.UserRepository;
import com.retail.ordering.service.InventoryService;
import com.retail.ordering.service.OrderService;
import com.retail.ordering.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ProductService productService;
    private final OrderService orderService;
    private final InventoryService inventoryService;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public AdminController(ProductService productService, OrderService orderService,
                           InventoryService inventoryService, ProductRepository productRepository,
                           OrderRepository orderRepository, UserRepository userRepository,
                           CategoryRepository categoryRepository) {
        this.productService = productService;
        this.orderService = orderService;
        this.inventoryService = inventoryService;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    // Dashboard
    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        DashboardStats stats = new DashboardStats(
                productRepository.count(),
                orderRepository.count(),
                userRepository.countByRolesName("ROLE_CUSTOMER"),
                orderRepository.countByStatus("PENDING")
        );
        return ResponseEntity.ok(stats);
    }

    // Products
    @PostMapping("/products")
    public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id,
                                                     @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(new ApiResponse("Product deleted successfully", true));
    }

    // Orders
    @GetMapping("/orders")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(@PathVariable Long id,
                                                       @RequestBody Map<String, String> request) {
        String status = request.get("status");
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    // Inventory
    @GetMapping("/inventory")
    public ResponseEntity<List<InventoryDTO>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @PutMapping("/inventory/{productId}")
    public ResponseEntity<InventoryDTO> updateInventory(@PathVariable Long productId,
                                                         @RequestBody Map<String, Integer> request) {
        Integer quantity = request.get("quantity");
        return ResponseEntity.ok(inventoryService.updateInventory(productId, quantity));
    }

    // Categories
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDTO>> getCategories() {
        List<CategoryDTO> categories = categoryRepository.findAll().stream()
                .map(c -> new CategoryDTO(c.getId(), c.getName(), c.getDescription()))
                .toList();
        return ResponseEntity.ok(categories);
    }
}
