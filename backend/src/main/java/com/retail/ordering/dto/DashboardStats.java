package com.retail.ordering.dto;

public class DashboardStats {
    private long totalProducts;
    private long totalOrders;
    private long totalCustomers;
    private long pendingOrders;

    public DashboardStats() {}

    public DashboardStats(long totalProducts, long totalOrders, long totalCustomers, long pendingOrders) {
        this.totalProducts = totalProducts;
        this.totalOrders = totalOrders;
        this.totalCustomers = totalCustomers;
        this.pendingOrders = pendingOrders;
    }

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }
    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }
    public long getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(long pendingOrders) { this.pendingOrders = pendingOrders; }
}
