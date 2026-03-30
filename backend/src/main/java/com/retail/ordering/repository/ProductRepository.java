package com.retail.ordering.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.retail.ordering.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryId(Long categoryId);
}
