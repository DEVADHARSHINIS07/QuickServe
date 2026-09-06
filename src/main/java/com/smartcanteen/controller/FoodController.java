package com.smartcanteen.controller;

import com.smartcanteen.dto.ApiResponse;
import com.smartcanteen.model.FoodItem;
import com.smartcanteen.service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/foods")
public class FoodController {

    @Autowired
    private FoodService foodService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FoodItem>>> getAllFoods() {
        return ResponseEntity.ok(ApiResponse.ok("Foods fetched successfully", foodService.getAllFoods()));
    }

    @GetMapping("/{foodId}")
    public ResponseEntity<ApiResponse<FoodItem>> getFoodById(@PathVariable String foodId) {
        return ResponseEntity.ok(ApiResponse.ok("Food details fetched", foodService.getFoodById(foodId)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<FoodItem>>> searchFoods(@RequestParam("q") String query) {
        return ResponseEntity.ok(ApiResponse.ok("Search results", foodService.searchFoods(query)));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<FoodItem>>> getCategoryFoods(@PathVariable String category) {
        return ResponseEntity.ok(ApiResponse.ok("Category foods", foodService.getFoodsByCategory(category)));
    }
}
