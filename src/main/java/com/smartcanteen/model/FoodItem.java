package com.smartcanteen.model;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class FoodItem {
    private Long id;
    private String foodId;
    private String name;
    private String description;
    private String category;
    private BigDecimal price;
    private String imageUrl;
    private boolean isVeg;
    private String availabilityStatus; // 'AVAILABLE', 'OUT_OF_STOCK'
    private Integer stockQuantity;
    private Integer minimumStockAlert;
    private Integer preparationTimeMinutes;
    private Integer popularRank;
    private String availableFrom;
    private String availableUntil;
    private String availableDays;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public FoodItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFoodId() { return foodId; }
    public void setFoodId(String foodId) { this.foodId = foodId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public boolean isVeg() { return isVeg; }
    public void setVeg(boolean isVeg) { this.isVeg = isVeg; }

    public String getAvailabilityStatus() { return availabilityStatus; }
    public void setAvailabilityStatus(String availabilityStatus) { this.availabilityStatus = availabilityStatus; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public Integer getMinimumStockAlert() { return minimumStockAlert; }
    public void setMinimumStockAlert(Integer minimumStockAlert) { this.minimumStockAlert = minimumStockAlert; }

    public Integer getPreparationTimeMinutes() { return preparationTimeMinutes; }
    public void setPreparationTimeMinutes(Integer preparationTimeMinutes) { this.preparationTimeMinutes = preparationTimeMinutes; }

    public Integer getPopularRank() { return popularRank; }
    public void setPopularRank(Integer popularRank) { this.popularRank = popularRank; }

    public String getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(String availableFrom) { this.availableFrom = availableFrom; }

    public String getAvailableUntil() { return availableUntil; }
    public void setAvailableUntil(String availableUntil) { this.availableUntil = availableUntil; }

    public String getAvailableDays() { return availableDays; }
    public void setAvailableDays(String availableDays) { this.availableDays = availableDays; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
}
