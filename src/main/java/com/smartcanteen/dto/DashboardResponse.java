package com.smartcanteen.dto;

import java.math.BigDecimal;
import java.util.List;
import com.smartcanteen.model.FoodItem;

public class DashboardResponse {
    private int todayOrders;
    private int pendingOrders;
    private int acceptedOrders;
    private int preparingOrders;
    private int readyOrders;
    private int completedOrders;
    private int rejectedOrders;
    private BigDecimal todayRevenue;
    private BigDecimal upiRevenue;
    private BigDecimal cashRevenue;
    private List<FoodItem> popularFoods;
    private List<FoodItem> lowStockFoods;

    public DashboardResponse() {}

    public int getTodayOrders() { return todayOrders; }
    public void setTodayOrders(int todayOrders) { this.todayOrders = todayOrders; }

    public int getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(int pendingOrders) { this.pendingOrders = pendingOrders; }

    public int getAcceptedOrders() { return acceptedOrders; }
    public void setAcceptedOrders(int acceptedOrders) { this.acceptedOrders = acceptedOrders; }

    public int getPreparingOrders() { return preparingOrders; }
    public void setPreparingOrders(int preparingOrders) { this.preparingOrders = preparingOrders; }

    public int getReadyOrders() { return readyOrders; }
    public void setReadyOrders(int readyOrders) { this.readyOrders = readyOrders; }

    public int getCompletedOrders() { return completedOrders; }
    public void setCompletedOrders(int completedOrders) { this.completedOrders = completedOrders; }

    public int getRejectedOrders() { return rejectedOrders; }
    public void setRejectedOrders(int rejectedOrders) { this.rejectedOrders = rejectedOrders; }

    public BigDecimal getTodayRevenue() { return todayRevenue; }
    public void setTodayRevenue(BigDecimal todayRevenue) { this.todayRevenue = todayRevenue; }

    public BigDecimal getUpiRevenue() { return upiRevenue; }
    public void setUpiRevenue(BigDecimal upiRevenue) { this.upiRevenue = upiRevenue; }

    public BigDecimal getCashRevenue() { return cashRevenue; }
    public void setCashRevenue(BigDecimal cashRevenue) { this.cashRevenue = cashRevenue; }

    public List<FoodItem> getPopularFoods() { return popularFoods; }
    public void setPopularFoods(List<FoodItem> popularFoods) { this.popularFoods = popularFoods; }

    public List<FoodItem> getLowStockFoods() { return lowStockFoods; }
    public void setLowStockFoods(List<FoodItem> lowStockFoods) { this.lowStockFoods = lowStockFoods; }
}
