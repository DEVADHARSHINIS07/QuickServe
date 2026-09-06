package com.smartcanteen.service;

import com.smartcanteen.dto.FoodDTOs.FoodCreateUpdateRequest;
import com.smartcanteen.exception.CustomExceptions.ResourceNotFoundException;
import com.smartcanteen.model.FoodItem;
import com.smartcanteen.repository.FoodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class FoodService {

    @Autowired
    private FoodRepository foodRepository;

    public List<FoodItem> getAllFoods() {
        return foodRepository.findAll();
    }

    public FoodItem getFoodById(String foodId) {
        return foodRepository.findByFoodId(foodId)
                .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + foodId));
    }

    public List<FoodItem> getFoodsByCategory(String category) {
        return foodRepository.findByCategory(category);
    }

    public List<FoodItem> searchFoods(String keyword) {
        return foodRepository.searchByName(keyword);
    }

    public FoodItem createFood(FoodCreateUpdateRequest req) {
        FoodItem food = new FoodItem();
        food.setFoodId("F" + (100 + (int)(Math.random() * 900)));
        food.setName(req.getName());
        food.setDescription(req.getDescription() != null ? req.getDescription() : "");
        food.setCategory(req.getCategory() != null ? req.getCategory() : "Fast Food");
        food.setPrice(req.getPrice());
        food.setImageUrl(req.getImage() != null ? req.getImage() : "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80");
        food.setVeg("veg".equalsIgnoreCase(req.getVegType()));
        food.setStockQuantity(req.getStock() != null ? req.getStock() : 20);
        food.setMinimumStockAlert(req.getMinimumStockAlert() != null ? req.getMinimumStockAlert() : 5);
        food.setPreparationTimeMinutes(req.getPreparationTimeMinutes() != null ? req.getPreparationTimeMinutes() : 10);
        food.setAvailabilityStatus(food.getStockQuantity() > 0 ? "AVAILABLE" : "OUT_OF_STOCK");
        food.setAvailableFrom(req.getAvailableFrom() != null ? req.getAvailableFrom() : "08:00");
        food.setAvailableUntil(req.getAvailableUntil() != null ? req.getAvailableUntil() : "19:00");

        foodRepository.save(food);
        return food;
    }

    public FoodItem updateFood(String foodId, FoodCreateUpdateRequest req) {
        FoodItem existing = getFoodById(foodId);

        if (req.getName() != null) existing.setName(req.getName());
        if (req.getDescription() != null) existing.setDescription(req.getDescription());
        if (req.getCategory() != null) existing.setCategory(req.getCategory());
        if (req.getPrice() != null) existing.setPrice(req.getPrice());
        if (req.getImage() != null) existing.setImageUrl(req.getImage());
        if (req.getVegType() != null) existing.setVeg("veg".equalsIgnoreCase(req.getVegType()));
        if (req.getStock() != null) {
            existing.setStockQuantity(req.getStock());
            existing.setAvailabilityStatus(req.getStock() > 0 ? "AVAILABLE" : "OUT_OF_STOCK");
        }
        if (req.getIsAvailable() != null) {
            existing.setAvailabilityStatus(req.getIsAvailable() ? "AVAILABLE" : "OUT_OF_STOCK");
        }
        if (req.getPreparationTimeMinutes() != null) existing.setPreparationTimeMinutes(req.getPreparationTimeMinutes());

        foodRepository.update(existing);
        return existing;
    }

    public void deleteFood(String foodId) {
        getFoodById(foodId);
        foodRepository.deleteByFoodId(foodId);
    }
}
