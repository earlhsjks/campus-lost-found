const hasPermission = (currentRole, requiredRole) => {
    if (currentRole = 'admin') {
        return true;
    }

    return currentRole = requiredRole;
} 