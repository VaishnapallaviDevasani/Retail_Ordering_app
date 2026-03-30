package com.retail.ordering.service;

import com.retail.ordering.dto.OrderDTO;
import com.retail.ordering.dto.OrderItemDTO;
import com.retail.ordering.entity.*;
import com.retail.ordering.exception.InsufficientStockException;
import com.retail.ordering.exception.ResourceNotFoundException;
import com.retail.ordering.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final InventoryRepository inventoryRepository;

    public OrderService(OrderRepository orderRepository, CartItemRepository cartItemRepository,
                        InventoryRepository inventoryRepository) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional
    public OrderDTO placeOrder(User user) {
        // 1. Validate cart
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        // 2. Check stock and calculate total (validate without reducing)
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            Inventory inventory = inventoryRepository.findByProductId(cartItem.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Inventory not found for product: " + cartItem.getProduct().getName()));

            if (inventory.getQuantity() < cartItem.getQuantity()) {
                throw new InsufficientStockException(
                        "Insufficient stock for " + cartItem.getProduct().getName()
                                + ". Available: " + inventory.getQuantity()
                                + ", Requested: " + cartItem.getQuantity());
            }

            totalAmount = totalAmount.add(
                    cartItem.getProduct().getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()))
            );
        }

        // 3. Create order
        Order order = new Order();
        order.setUser(user);
        order.setTotalAmount(totalAmount);
        order.setStatus("PENDING");

        // 4. Create order items
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getProduct().getPrice());
            orderItems.add(orderItem);
        }
        order.setOrderItems(orderItems);

        // 5. Save order
        Order savedOrder = orderRepository.save(order);

        // 6. Clear cart (inventory will be reduced when order is confirmed)
        cartItemRepository.deleteByUser(user);

        return mapToDTO(savedOrder);
    }

    public List<OrderDTO> getMyOrders(User user) {
        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // If status is being changed to CONFIRMED, update inventory
        if ("CONFIRMED".equalsIgnoreCase(status) && !"CONFIRMED".equalsIgnoreCase(order.getStatus())) {
            updateInventoryForConfirmedOrder(order);
        }

        order.setStatus(status);
        Order saved = orderRepository.save(order);
        return mapToDTO(saved);
    }

    @Transactional
    private void updateInventoryForConfirmedOrder(Order order) {
        // Reduce inventory for each item in the order when order is confirmed
        for (OrderItem orderItem : order.getOrderItems()) {
            Inventory inventory = inventoryRepository.findByProductId(orderItem.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Inventory not found for product: " + orderItem.getProduct().getName()));

            // Check if there's enough stock
            if (inventory.getQuantity() < orderItem.getQuantity()) {
                throw new InsufficientStockException(
                        "Insufficient stock for " + orderItem.getProduct().getName()
                                + ". Available: " + inventory.getQuantity()
                                + ", Requested: " + orderItem.getQuantity());
            }

            // Reduce inventory
            inventory.setQuantity(inventory.getQuantity() - orderItem.getQuantity());
            inventoryRepository.save(inventory);
        }
    }

    private OrderDTO mapToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUsername(order.getUser().getUsername());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setItems(order.getOrderItems().stream()
                .map(this::mapItemToDTO)
                .collect(Collectors.toList()));
        return dto;
    }

    private OrderItemDTO mapItemToDTO(OrderItem item) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());
        dto.setQuantity(item.getQuantity());
        dto.setPrice(item.getPrice());
        return dto;
    }
}
