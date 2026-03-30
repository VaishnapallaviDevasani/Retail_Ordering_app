package com.retail.ordering.config;

import com.retail.ordering.entity.*;
import com.retail.ordering.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collections;

@Component
public class DataLoader implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(RoleRepository roleRepository, UserRepository userRepository,
                      CategoryRepository categoryRepository, ProductRepository productRepository,
                      InventoryRepository inventoryRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Create roles
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_ADMIN")));
        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_CUSTOMER")));

        // Create admin user
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@retailstore.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRoles(Collections.singleton(adminRole));
            userRepository.save(admin);
            System.out.println("✅ Admin user created (admin / admin123)");
        }

        // Create categories
        Category pizza = categoryRepository.findByName("Pizza").isPresent() ? null :
                categoryRepository.save(new Category("Pizza", "Delicious freshly baked pizzas"));
        Category drinks = categoryRepository.findByName("Cold Drinks").isPresent() ? null :
                categoryRepository.save(new Category("Cold Drinks", "Refreshing cold beverages"));
        Category breads = categoryRepository.findByName("Breads").isPresent() ? null :
                categoryRepository.save(new Category("Breads", "Freshly baked artisan breads"));

        if (pizza == null) pizza = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equals("Pizza")).findFirst().orElse(null);
        if (drinks == null) drinks = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equals("Cold Drinks")).findFirst().orElse(null);
        if (breads == null) breads = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equals("Breads")).findFirst().orElse(null);

        // Seed products only if none exist
        if (productRepository.count() == 0) {
            // Pizzas
            createProduct("Margherita Pizza", "Classic tomato sauce, mozzarella, and fresh basil",
                    new BigDecimal("299.00"), "🍕", pizza, 50);
            createProduct("Pepperoni Pizza", "Loaded with spicy pepperoni and melted cheese",
                    new BigDecimal("399.00"), "🍕", pizza, 40);
            createProduct("BBQ Chicken Pizza", "Smoky BBQ sauce, grilled chicken, red onions",
                    new BigDecimal("449.00"), "🍕", pizza, 35);
            createProduct("Veggie Supreme", "Bell peppers, mushrooms, olives, onions, tomatoes",
                    new BigDecimal("349.00"), "🍕", pizza, 45);
            createProduct("Four Cheese Pizza", "Mozzarella, cheddar, parmesan, gorgonzola blend",
                    new BigDecimal("429.00"), "🍕", pizza, 30);

            // Cold Drinks
            createProduct("Coca-Cola 500ml", "Classic refreshing cola",
                    new BigDecimal("49.00"), "🥤", drinks, 100);
            createProduct("Fresh Lemonade", "Freshly squeezed lemon with mint",
                    new BigDecimal("79.00"), "🍋", drinks, 80);
            createProduct("Mango Smoothie", "Thick and creamy mango smoothie",
                    new BigDecimal("129.00"), "🥭", drinks, 60);
            createProduct("Iced Coffee", "Cold brewed coffee with cream",
                    new BigDecimal("149.00"), "☕", drinks, 70);
            createProduct("Sparkling Water", "Naturally carbonated mineral water",
                    new BigDecimal("39.00"), "💧", drinks, 120);

            // Breads
            createProduct("Garlic Bread", "Toasted bread with garlic butter and herbs",
                    new BigDecimal("149.00"), "🍞", breads, 60);
            createProduct("Cheese Breadsticks", "Crispy breadsticks stuffed with cheese",
                    new BigDecimal("179.00"), "🧀", breads, 50);
            createProduct("Whole Wheat Bread", "Healthy whole wheat artisan bread",
                    new BigDecimal("89.00"), "🍞", breads, 40);
            createProduct("Focaccia", "Italian flatbread with rosemary and olive oil",
                    new BigDecimal("199.00"), "🫓", breads, 35);
            createProduct("Cinnamon Roll", "Sweet roll with cinnamon sugar and glaze",
                    new BigDecimal("129.00"), "🧁", breads, 45);

            System.out.println("✅ Sample products seeded");
        }
    }

    private void createProduct(String name, String description, BigDecimal price,
                                String imageUrl, Category category, int stock) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setImageUrl(imageUrl);
        product.setCategory(category);
        Product saved = productRepository.save(product);

        Inventory inventory = new Inventory(saved, stock);
        inventoryRepository.save(inventory);
    }

    // Helper to find category by name
    private boolean categoryExists(String name) {
        return categoryRepository.findAll().stream().anyMatch(c -> c.getName().equals(name));
    }
}
