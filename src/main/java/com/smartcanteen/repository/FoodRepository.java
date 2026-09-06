package com.smartcanteen.repository;

import com.smartcanteen.model.FoodItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class FoodRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<FoodItem> foodRowMapper = (rs, rowNum) -> {
        FoodItem item = new FoodItem();
        item.setId(rs.getLong("id"));
        item.setFoodId(rs.getString("food_id"));
        item.setName(rs.getString("name"));
        item.setDescription(rs.getString("description"));
        item.setCategory(rs.getString("category"));
        item.setPrice(rs.getBigDecimal("price"));
        item.setImageUrl(rs.getString("image_url"));
        item.setVeg(rs.getBoolean("is_veg"));
        item.setAvailabilityStatus(rs.getString("availability_status"));
        item.setStockQuantity(rs.getInt("stock_quantity"));
        item.setMinimumStockAlert(rs.getInt("minimum_stock_alert"));
        item.setPreparationTimeMinutes(rs.getInt("preparation_time_minutes"));
        item.setPopularRank(rs.getInt("popular_rank"));
        item.setAvailableFrom(rs.getString("available_from"));
        item.setAvailableUntil(rs.getString("available_until"));
        item.setAvailableDays(rs.getString("available_days"));
        item.setCreatedAt(rs.getTimestamp("created_at"));
        item.setUpdatedAt(rs.getTimestamp("updated_at"));
        return item;
    };

    public List<FoodItem> findAll() {
        String sql = "SELECT * FROM foods ORDER BY popular_rank DESC, name ASC";
        return jdbcTemplate.query(sql, foodRowMapper);
    }

    public Optional<FoodItem> findByFoodId(String foodId) {
        String sql = "SELECT * FROM foods WHERE food_id = ?";
        List<FoodItem> list = jdbcTemplate.query(sql, foodRowMapper, foodId);
        return list.stream().findFirst();
    }

    public List<FoodItem> findByCategory(String category) {
        String sql = "SELECT * FROM foods WHERE category = ? ORDER BY name ASC";
        return jdbcTemplate.query(sql, foodRowMapper, category);
    }

    public List<FoodItem> searchByName(String keyword) {
        String sql = "SELECT * FROM foods WHERE LOWER(name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?) ORDER BY name ASC";
        String term = "%" + keyword.trim() + "%";
        return jdbcTemplate.query(sql, foodRowMapper, term, term);
    }

    public List<FoodItem> findLowStockFoods() {
        String sql = "SELECT * FROM foods WHERE stock_quantity <= minimum_stock_alert ORDER BY stock_quantity ASC";
        return jdbcTemplate.query(sql, foodRowMapper);
    }

    public int save(FoodItem food) {
        String sql = "INSERT INTO foods (food_id, name, description, category, price, image_url, is_veg, availability_status, stock_quantity, minimum_stock_alert, preparation_time_minutes, available_from, available_until) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        return jdbcTemplate.update(sql,
                food.getFoodId(),
                food.getName(),
                food.getDescription(),
                food.getCategory(),
                food.getPrice(),
                food.getImageUrl(),
                food.isVeg(),
                food.getAvailabilityStatus(),
                food.getStockQuantity(),
                food.getMinimumStockAlert(),
                food.getPreparationTimeMinutes(),
                food.getAvailableFrom() != null ? food.getAvailableFrom() : "08:00",
                food.getAvailableUntil() != null ? food.getAvailableUntil() : "19:00"
        );
    }

    public int update(FoodItem food) {
        String sql = "UPDATE foods SET name = ?, description = ?, category = ?, price = ?, image_url = ?, is_veg = ?, " +
                     "availability_status = ?, stock_quantity = ?, minimum_stock_alert = ?, preparation_time_minutes = ?, updated_at = CURRENT_TIMESTAMP " +
                     "WHERE food_id = ?";
        return jdbcTemplate.update(sql,
                food.getName(),
                food.getDescription(),
                food.getCategory(),
                food.getPrice(),
                food.getImageUrl(),
                food.isVeg(),
                food.getAvailabilityStatus(),
                food.getStockQuantity(),
                food.getMinimumStockAlert(),
                food.getPreparationTimeMinutes(),
                food.getFoodId()
        );
    }

    public int updateStock(String foodId, int newQuantity, String availabilityStatus) {
        String sql = "UPDATE foods SET stock_quantity = ?, availability_status = ?, updated_at = CURRENT_TIMESTAMP WHERE food_id = ?";
        return jdbcTemplate.update(sql, newQuantity, availabilityStatus, foodId);
    }

    public int deleteByFoodId(String foodId) {
        String sql = "DELETE FROM foods WHERE food_id = ?";
        return jdbcTemplate.update(sql, foodId);
    }
}
