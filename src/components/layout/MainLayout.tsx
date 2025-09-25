import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Typography, 
  Space, 
  Avatar, 
  Dropdown, 
  Badge,
  Menu,
  Button as AntButton
} from 'antd';
import { 
  UserOutlined, 
  DashboardOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  TeamOutlined,
  CalendarOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { 
  Layout, 
  LayoutHeader, 
  LayoutContent, 
  LayoutSider 
} from '../ui';
import { useAuth } from '../../context/AuthContext';
import { createUserMenuItems, createSideMenuItems, ROUTES } from '../../routes';

const { Title, Text } = Typography;

export const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.SIGNIN);
  };

  // Crear los iconos para los menús
  const userIcons = {
    UserOutlined: <UserOutlined />,
    SettingOutlined: <SettingOutlined />,
    LogoutOutlined: <LogoutOutlined />
  };

  const sideIcons = {
    DashboardOutlined: <DashboardOutlined />,
    TeamOutlined: <TeamOutlined />,
    CalendarOutlined: <CalendarOutlined />,
    BarChartOutlined: <BarChartOutlined />,
    SettingOutlined: <SettingOutlined />
  };

  // Items del menú del usuario
  const userMenuItems = createUserMenuItems(navigate, handleLogout, userIcons);

  // Items del menú lateral
  const sideMenuItems = createSideMenuItems(navigate, sideIcons);

  return (
    <Layout>
      <LayoutSider 
        collapsed={collapsed}
        width={250}
        style={{
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100
        }}
      >
        {/* Logo del sidebar */}
        <div style={{
          height: 65,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 24px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          {!collapsed && (
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              TalentHub Pro
            </Title>
          )}
          {collapsed && (
            <DashboardOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          )}
        </div>

        {/* Menú de navegación */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ borderRight: 0, height: 'calc(100vh - 64px)' }}
          items={sideMenuItems}
        />
      </LayoutSider>

      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
        <LayoutHeader style={{
          position: 'fixed',
          top: 0,
          right: 0,
          left: collapsed ? 80 : 250,
          zIndex: 99,
          transition: 'left 0.2s'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            height: '100%'
          }}>
            {/* Botón para colapsar sidebar */}
            <AntButton
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px' }}
            />
            
            {/* Usuario y notificaciones */}
            <Space size="large">
              <Badge count={5} >
                <AntButton 
                  type="text" 
                  icon={<BellOutlined />} 
                  size="middle"
                  onClick={() => navigate(ROUTES.NOTIFICATIONS)}
                />
              </Badge>
              
              <Dropdown 
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Space style={{ cursor: 'pointer', padding: '8px' }}>
                  <Avatar icon={<UserOutlined />} />
                  <div style={{ display: collapsed ? 'none' : 'flex' , flexDirection: 'column'}}>
                    <Text strong>
                      {user?.name && user.name !== 'Usuario' ? user.name : 'Usuario Invitado'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {user?.role === 'admin' ? 'Administrador' : 
                       user?.role === 'manager' ? 'Gerente' : 
                       user?.role === 'employee' ? 'Empleado' : 'Usuario'}
                    </Text>
                  </div>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </LayoutHeader>

        <LayoutContent style={{
          marginTop: 64,
          minHeight: 'calc(100vh - 64px)',
          background: '#f5f5f5'
        }}>
          <Outlet />
        </LayoutContent>
      </Layout>
    </Layout>
  );
};
