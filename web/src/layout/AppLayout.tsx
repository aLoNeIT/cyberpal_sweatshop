import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar, Space, Tag, theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
} from '@ant-design/icons';
import siderNav, { toMenuItems } from './SiderNav';
import { useAuthStore } from '../store/authStore';
import { useThemeContext } from '../theme/ThemeProvider';

const { Header, Sider, Content } = Layout;

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { mode, toggle } = useThemeContext();
  const { token: antToken } = theme.useToken();

  // 当前选中菜单项
  const selectedKey = siderNav.find((item) =>
    location.pathname.startsWith(item.path),
  )?.key ?? 'dashboard';

  const handleMenuClick = (info: { key: string }) => {
    const item = siderNav.find((n) => n.key === info.key);
    if (item) navigate(item.path);
  };

  const userMenuItems = [
    { key: 'settings', icon: <SettingOutlined />, label: '设置' },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '登出',
      danger: true,
    },
  ];

  const handleUserMenu = (info: { key: string }) => {
    if (info.key === 'logout') {
      logout();
      navigate('/login');
    } else if (info.key === 'settings') {
      navigate('/settings');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ── Sider ── */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        collapsedWidth={64}
        style={{
          background: antToken.colorBgContainer,
          borderRight: `1px solid ${antToken.colorBorder}`,
        }}
      >
        {/* 品牌 Logo */}
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${antToken.colorBorder}`,
            fontWeight: 700,
            fontSize: collapsed ? 16 : 18,
            color: antToken.colorPrimary,
            cursor: 'pointer',
          }}
          onClick={() => navigate('/dashboard')}
        >
          {collapsed ? '🤖' : '🤖 Pi-Agent'}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={toMenuItems(siderNav)}
          onClick={handleMenuClick}
          style={{ borderInlineEnd: 'none', marginTop: 8 }}
        />
      </Sider>

      <Layout>
        {/* ── Header ── */}
        <Header
          style={{
            background: antToken.colorBgContainer,
            borderBottom: `1px solid ${antToken.colorBorder}`,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 56,
            lineHeight: '56px',
          }}
        >
          {/* 左侧：折叠按钮 */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />

          {/* 右侧：主题 + 通知 + 用户 */}
          <Space size={16}>
            {/* 计费概览占位 */}
            <Tag color="blue" style={{ cursor: 'pointer' }} onClick={() => navigate('/billing')}>
              本月 -- / -- tok
            </Tag>

            {/* 主题切换 */}
            <Button type="text" onClick={toggle}>
              {mode === 'light' ? '🌙' : '☀️'}
            </Button>

            {/* 通知 */}
            <Button type="text" icon={<BellOutlined />} />

            {/* 用户下拉 */}
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenu }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size={32} icon={<UserOutlined />} />
                <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.display_name || user?.email || '用户'}
                </span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* ── Content ── */}
        <Content
          style={{
            margin: 0,
            padding: 24,
            background: antToken.colorBgLayout,
            minHeight: 'calc(100vh - 56px)',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
