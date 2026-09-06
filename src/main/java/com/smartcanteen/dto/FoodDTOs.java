package com.smartcanteen.dto;

import java.math.BigDecimal;

public class FoodDTOs {

    public static class FoodCreateUpdateRequest {
        private String name;
        private String description;
        private String category;
        private BigDecimal price;
        private String image;
        private String vegType; // 'veg' or 'non-veg'
        private Boolean isAvailable;
        private Integer stock;
        private Integer minimumStockAlert;
        private Integer preparationTimeMinutes;
        private String availableFrom;
        private String availableUntil;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }

        public String getImage() { return image; }
        public void setImage(String image) { this.image = image; }

        public String getVegType() { return vegType; }
        public void setVegType(String vegType) { this.vegType = vegType; }

        public Boolean getIsAvailable() { return isAvailable; }
        public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }

        public Integer getStock() { return stock; }
        public void setStock(Integer stock) { this.stock = stock; }

        public Integer getMinimumStockAlert() { return minimumStockAlert; }
        public void setMinimumStockAlert(Integer minimumStockAlert) { this.minimumStockAlert = minimumStockAlert; }

        public Integer getPreparationTimeMinutes() { return preparationTimeMinutes; }
        public void setPreparationTimeMinutes(Integer preparationTimeMinutes) { this.preparationTimeMinutes = preparationTimeMinutes; }

        public String getAvailableFrom() { return availableFrom; }
        public void setAvailableFrom(String availableFrom) { this.availableFrom = availableFrom; }

        public String getAvailableUntil() { return availableUntil; }
        public void setAvailableUntil(String availableUntil) { this.availableUntil = availableUntil; }
    }
}
