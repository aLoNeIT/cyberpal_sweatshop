import React from 'react';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  RobotOutlined,
  MessageOutlined,
  DollarOutlined,
  SettingOutlined,
} from '@ant-design/icons';

export interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  children?: NavItem[];
}

const siderNav: NavItem[] = [
  { key: 'dashboard', label: '概览', icon: <DashboardOutlined />, path: '/dashboard' },
  { key: 'agents', label: '我的 Agent', icon: <RobotOutlined />, path: '/agents' },
  { key: 'sessions', label: '会话', icon: <MessageOutlined />, path: '/sessions' },
  { key: 'billing', label: '消费', icon: <DollarOutlined />, path: '/billing' },
  { key: 'settings', label: '设置', icon: <SettingOutlined />, path: '/settings' },
];

/** 将 NavItem[] 转为 AntD Menu items */
export function toMenuItems(items: NavItem[]): MenuProps['items'] {
  return items.map((item) => ({
    key: item.key,
    label: item.label,
    icon: item.icon,
    children: item.children ? toMenuItems(item.children) : undefined,
  }));
}

export default siderNav;
