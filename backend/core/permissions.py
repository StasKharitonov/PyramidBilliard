from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """Object-level permission: only the owner may access the object."""

    message = "Вы можете управлять только своими записями."

    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user.id
