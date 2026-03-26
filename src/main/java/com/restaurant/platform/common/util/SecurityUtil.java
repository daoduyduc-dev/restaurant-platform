package com.restaurant.platform.common.util;

import com.restaurant.platform.common.constant.AppConstants;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtil {

    private SecurityUtil() {}

    public static String getCurrentUsername() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return AppConstants.SYSTEM_USER;
        }

        return authentication.getName();
    }
}
