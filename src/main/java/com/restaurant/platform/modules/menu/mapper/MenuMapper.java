package com.restaurant.platform.modules.menu.mapper;

import com.restaurant.platform.modules.menu.dto.CreateMenuItemRequest;
import com.restaurant.platform.modules.menu.dto.MenuItemResponse;
import com.restaurant.platform.modules.menu.entity.MenuItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
        componentModel = "spring",
        builder = @org.mapstruct.Builder(disableBuilder = true)
)
public interface MenuMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    MenuItem toEntity(CreateMenuItemRequest request);

    @Mapping(target = "categoryId", expression = "java(item.getCategory() != null ? item.getCategory().getId() : null)")
    @Mapping(target = "categoryName", expression = "java(item.getCategory() != null ? item.getCategory().getName() : null)")
    @Mapping(target = "isAvailable", source = "available")
    MenuItemResponse toResponse(MenuItem item);
}
