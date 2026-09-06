package com.smartcanteen.repository;

import com.smartcanteen.model.OrderItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class OrderItemRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<OrderItem> itemRowMapper = (rs, rowNum) -> {
        OrderItem item = new OrderItem();
        item.setId(rs.getLong("id"));
        item.setOrderId(rs.getString("order_id"));
        item.setFoodId(rs.getString("food_id"));
        item.setFoodName(rs.getString("food_name"));
        item.setQuantity(rs.getInt("quantity"));
        item.setUnitPrice(rs.getBigDecimal("unit_price"));
        item.setTotalPrice(rs.getBigDecimal("total_price"));
        item.setImageUrl(rs.getString("image_url"));
        item.setVeg(rs.getBoolean("is_veg"));
        return item;
    };

    public List<OrderItem> findByOrderId(String orderId) {
        String sql = "SELECT * FROM order_items WHERE order_id = ?";
        return jdbcTemplate.query(sql, itemRowMapper, orderId);
    }

    public void saveAll(List<OrderItem> items) {
        String sql = "INSERT INTO order_items (order_id, food_id, food_name, quantity, unit_price, total_price, image_url, is_veg) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        for (OrderItem item : items) {
            jdbcTemplate.update(sql,
                    item.getOrderId(),
                    item.getFoodId(),
                    item.getFoodName(),
                    item.getQuantity(),
                    item.getUnitPrice(),
                    item.getTotalPrice(),
                    item.getImageUrl(),
                    item.isVeg()
            );
        }
    }
}
