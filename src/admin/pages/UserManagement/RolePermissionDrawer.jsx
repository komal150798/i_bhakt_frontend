import { useState, useEffect } from 'react';
import { adminApi } from '../../../common/api/adminApi';
import styles from './RolePermissionDrawer.module.css';

function RolePermissionDrawer({ role, onClose, onSave }) {
  const [loading, setLoading] = useState(true);
  const [permissionsTree, setPermissionsTree] = useState([]);
  const [permissionMap, setPermissionMap] = useState(new Map());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (role) {
      const roleId = role.role_id || role.id;
      if (roleId) {
        fetchPermissions();
      } else {
        console.error('RolePermissionDrawer: Role ID is missing in role object:', role);
        setLoading(false);
      }
    }
  }, [role]);

  const fetchPermissions = async () => {
    if (!role) return;
    
    const roleId = role.role_id || role.id;
    if (!roleId) {
      console.error('Role ID is missing:', role);
      return;
    }

    try {
      setLoading(true);
      const [treeData, rolePermissions] = await Promise.all([
        adminApi.getPermissionsTree(),
        adminApi.getRolePermissions(roleId),
      ]);

      setPermissionsTree(Array.isArray(treeData) ? treeData : treeData.data || []);

      // Create map of permission_id -> is_allowed
      const map = new Map();
      const permissions = rolePermissions.permissions || rolePermissions.data?.permissions || [];
      permissions.forEach((perm) => {
        map.set(perm.permission_id, perm.is_allowed || false);
      });
      setPermissionMap(map);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = (permissionId) => {
    const newMap = new Map(permissionMap);
    newMap.set(permissionId, !(newMap.get(permissionId) || false));
    setPermissionMap(newMap);
  };

  const handleSave = async () => {
    if (!role) return;
    
    const roleId = role.role_id || role.id;
    if (!roleId) {
      alert('Role ID is missing');
      return;
    }

    try {
      setSaving(true);
      const permissions = Array.from(permissionMap.entries()).map(([permission_id, is_allowed]) => ({
        permission_id,
        is_allowed,
      }));

      await adminApi.updateRolePermissions(roleId, permissions);
      onSave();
    } catch (error) {
      console.error('Failed to save permissions:', error);
      alert(error.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const renderPermissionTree = (items, level = 0) => {
    return items.map((item) => (
      <div key={item.permission_id} className={styles.permissionItem} style={{ paddingLeft: `${level * 1.5}rem` }}>
        <label className={styles.permissionLabel}>
          <input
            type="checkbox"
            checked={permissionMap.get(item.permission_id) || false}
            onChange={() => handleTogglePermission(item.permission_id)}
            className={styles.permissionCheckbox}
          />
          <span className={styles.permissionName}>{item.menu_name}</span>
        </label>
        {item.children && item.children.length > 0 && (
          <div className={styles.permissionChildren}>
            {renderPermissionTree(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <div>
            <h2>Manage Permissions</h2>
            <p className={styles.roleName}>{role?.role?.role_name || role?.role_name || 'Unknown Role'}</p>
          </div>
          <button onClick={onClose} className={styles.drawerClose}>
            ×
          </button>
        </div>

        <div className={styles.drawerBody}>
          {loading ? (
            <div className={styles.loading}>Loading permissions...</div>
          ) : (
            <div className={styles.permissionsList}>
              {permissionsTree.length === 0 ? (
                <div className={styles.empty}>No permissions available</div>
              ) : (
                renderPermissionTree(permissionsTree)
              )}
            </div>
          )}
        </div>

        <div className={styles.drawerFooter}>
          <button onClick={onClose} className={styles.btnCancel} disabled={saving}>
            Cancel
          </button>
          <button onClick={handleSave} className={styles.btnSave} disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save Permissions'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RolePermissionDrawer;
